import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type DatabaseOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
};

type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured."
    );
  }

  if (!supabaseSecretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not configured."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  keySecret: string
): boolean {
  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        keySecret
      )
      .update(
        `${razorpayOrderId}|${razorpayPaymentId}`
      )
      .digest("hex");

  const generatedBuffer =
    Buffer.from(
      generatedSignature,
      "utf8"
    );

  const receivedBuffer =
    Buffer.from(
      razorpaySignature,
      "utf8"
    );

  if (
    generatedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    generatedBuffer,
    receivedBuffer
  );
}

export async function POST(
  request: Request
) {
  try {
    /*
     * -------------------------------------------------------
     * ENVIRONMENT
     * -------------------------------------------------------
     */
    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay Key ID is not configured.",
        },
        { status: 500 }
      );
    }

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay secret key is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * -------------------------------------------------------
     * READ RAZORPAY RESPONSE
     * -------------------------------------------------------
     */
    const body =
      await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      typeof razorpay_order_id !==
        "string" ||
      typeof razorpay_payment_id !==
        "string" ||
      typeof razorpay_signature !==
        "string" ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Incomplete Razorpay payment response.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Starting Razorpay payment verification:",
      {
        razorpayOrderId:
          razorpay_order_id,
        razorpayPaymentId:
          razorpay_payment_id,
      }
    );

    /*
     * -------------------------------------------------------
     * VERIFY RAZORPAY SIGNATURE
     * -------------------------------------------------------
     */
    const signatureValid =
      verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        keySecret
      );

    if (!signatureValid) {
      console.error(
        "Razorpay signature verification failed:",
        {
          razorpayOrderId:
            razorpay_order_id,
          razorpayPaymentId:
            razorpay_payment_id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Razorpay signature verified successfully."
    );

    /*
     * -------------------------------------------------------
     * SUPABASE
     * -------------------------------------------------------
     */
    const supabase =
      getSupabaseAdmin();

    /*
     * -------------------------------------------------------
     * FIND RMX ORDER
     * -------------------------------------------------------
     */
    const {
      data,
      error:
        orderLookupError,
    } =
      await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            status,
            payment_status,
            total,
            razorpay_order_id,
            razorpay_payment_id
          `
        )
        .eq(
          "razorpay_order_id",
          razorpay_order_id
        )
        .maybeSingle();

    if (orderLookupError) {
      console.error(
        "Supabase order lookup error:",
        orderLookupError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to find the RMX order for this payment.",
        },
        { status: 500 }
      );
    }

    /*
     * Explicitly type the Supabase result.
     */
    const rmxOrder =
      data as DatabaseOrder | null;

    if (!rmxOrder) {
      console.error(
        "No RMX order found for Razorpay order:",
        razorpay_order_id
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "RMX order could not be found for this payment.",
        },
        { status: 404 }
      );
    }

    console.log(
      "RMX order found:",
      {
        databaseOrderId:
          rmxOrder.id,
        orderNumber:
          rmxOrder.order_number,
        total:
          rmxOrder.total,
        paymentStatus:
          rmxOrder.payment_status,
        status:
          rmxOrder.status,
      }
    );

    /*
     * -------------------------------------------------------
     * PREVENT DUPLICATE PAYMENT PROCESSING
     * -------------------------------------------------------
     *
     * IMPORTANT:
     * Your existing database constraint allows "paid"
     * but does NOT allow "confirmed".
     *
     * Therefore "paid" is the final successful status
     * for the orders.status column.
     */
    if (
      rmxOrder.payment_status ===
        "paid" ||
      rmxOrder.status ===
        "paid"
    ) {
      /*
       * If the same payment was already recorded,
       * return success.
       */
      if (
        rmxOrder.razorpay_payment_id ===
        razorpay_payment_id
      ) {
        return NextResponse.json({
          success: true,

          message:
            "Payment was already verified.",

          paymentId:
            razorpay_payment_id,

          orderId:
            razorpay_order_id,

          databaseOrderId:
            rmxOrder.id,

          orderNumber:
            rmxOrder.order_number,

          status:
            "paid",

          paymentStatus:
            "paid",
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "This RMX order has already been paid.",
        },
        { status: 409 }
      );
    }

    /*
     * -------------------------------------------------------
     * CREATE RAZORPAY CLIENT
     * -------------------------------------------------------
     */
    const razorpay =
      new Razorpay({
        key_id: keyId,
        key_secret:
          keySecret,
      });

    /*
     * -------------------------------------------------------
     * FETCH PAYMENT FROM RAZORPAY
     * -------------------------------------------------------
     *
     * We verify the payment directly with Razorpay
     * instead of trusting only the browser callback.
     */
    const paymentResponse =
      await razorpay.payments.fetch(
        razorpay_payment_id
      );

    const payment =
      paymentResponse as unknown as RazorpayPayment;

    console.log(
      "Razorpay payment fetched:",
      {
        paymentId:
          payment.id,
        orderId:
          payment.order_id,
        amount:
          payment.amount,
        currency:
          payment.currency,
        status:
          payment.status,
      }
    );

    /*
     * -------------------------------------------------------
     * VERIFY PAYMENT BELONGS TO THIS RAZORPAY ORDER
     * -------------------------------------------------------
     */
    if (
      payment.order_id !==
      razorpay_order_id
    ) {
      console.error(
        "Razorpay payment/order mismatch:",
        {
          expectedOrderId:
            razorpay_order_id,
          paymentOrderId:
            payment.order_id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment does not belong to this order.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * VERIFY CURRENCY
     * -------------------------------------------------------
     */
    if (
      payment.currency !==
      "INR"
    ) {
      console.error(
        "Unexpected payment currency:",
        payment.currency
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid payment currency.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * VERIFY PAYMENT AMOUNT
     * -------------------------------------------------------
     *
     * Supabase:
     * total = rupees
     *
     * Razorpay:
     * amount = paise
     *
     * ₹799 = 79900 paise
     */
    const expectedAmountInPaise =
      Math.round(
        Number(
          rmxOrder.total
        ) * 100
      );

    if (
      !Number.isFinite(
        expectedAmountInPaise
      ) ||
      expectedAmountInPaise <= 0
    ) {
      console.error(
        "Invalid RMX order total:",
        rmxOrder.total
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid RMX order amount.",
        },
        { status: 500 }
      );
    }

    if (
      Number(
        payment.amount
      ) !==
      expectedAmountInPaise
    ) {
      console.error(
        "Payment amount mismatch:",
        {
          expectedAmountInPaise,

          receivedAmountInPaise:
            payment.amount,

          expectedRupees:
            Number(
              rmxOrder.total
            ),

          receivedRupees:
            Number(
              payment.amount
            ) / 100,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match the RMX order.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * VERIFY PAYMENT STATUS
     * -------------------------------------------------------
     *
     * Only captured payments are accepted as paid.
     */
    if (
      payment.status !==
      "captured"
    ) {
      console.error(
        "Payment is not captured:",
        {
          paymentId:
            payment.id,
          status:
            payment.status,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment has not been captured yet.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * UPDATE SUPABASE ORDER
     * -------------------------------------------------------
     *
     * IMPORTANT:
     *
     * Your actual database constraint supports:
     *
     * status = "paid"
     *
     * It does NOT support:
     *
     * status = "confirmed"
     *
     * Therefore we use "paid" here.
     *
     * Final database state:
     *
     * status:
     * paid
     *
     * payment_status:
     * paid
     *
     * razorpay_order_id:
     * order_...
     *
     * razorpay_payment_id:
     * pay_...
     */
    const {
      data:
        updatedOrderData,
      error:
        updateOrderError,
    } =
      await supabase
        .from("orders")
        .update({
          status:
            "paid",

          payment_status:
            "paid",

          razorpay_payment_id:
            razorpay_payment_id,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          rmxOrder.id
        )
        .select(
          `
            id,
            order_number,
            status,
            payment_status,
            total,
            razorpay_order_id,
            razorpay_payment_id
          `
        )
        .maybeSingle();

    if (updateOrderError) {
      console.error(
        "Supabase payment update error:",
        updateOrderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was verified, but the RMX order could not be updated. Please contact RMX Nexus before making another payment.",
        },
        { status: 500 }
      );
    }

    /*
     * Explicitly type updated Supabase row.
     */
    const updatedOrder =
      updatedOrderData as DatabaseOrder | null;

    if (!updatedOrder) {
      console.error(
        "Supabase order update returned no order."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was verified, but the updated RMX order could not be confirmed.",
        },
        { status: 500 }
      );
    }

    console.log(
      "RMX order payment status updated successfully:",
      {
        databaseOrderId:
          updatedOrder.id,

        orderNumber:
          updatedOrder.order_number,

        status:
          updatedOrder.status,

        paymentStatus:
          updatedOrder.payment_status,

        razorpayOrderId:
          updatedOrder.razorpay_order_id,

        razorpayPaymentId:
          updatedOrder.razorpay_payment_id,
      }
    );

    /*
     * -------------------------------------------------------
     * FINAL RESPONSE
     * -------------------------------------------------------
     */
    return NextResponse.json({
      success: true,

      message:
        "Payment verified and RMX order marked as paid.",

      paymentId:
        razorpay_payment_id,

      orderId:
        razorpay_order_id,

      databaseOrderId:
        updatedOrder.id,

      orderNumber:
        updatedOrder.order_number,

      status:
        updatedOrder.status,

      paymentStatus:
        updatedOrder.payment_status,

      amount:
        payment.amount,

      currency:
        payment.currency,
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}