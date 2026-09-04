import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SIZE_PRICES: Record<string, number> = {
  standard: 799,
  large: 1199,
};

const PREPAID_DISCOUNT_RATE = 0.05;

type DatabaseOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  size: string;
  frame: string;
  lithophane: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  total: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
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
     * REQUEST
     * -------------------------------------------------------
     *
     * The browser sends only the customer-facing
     * RMX order number.
     *
     * We do NOT trust price, quantity or total
     * from the browser here.
     */
    const body =
      await request.json();

    const orderNumber =
      typeof body?.orderNumber ===
      "string"
        ? body.orderNumber.trim()
        : "";

    if (!orderNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "RMX order number is required.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * SUPABASE
     * -------------------------------------------------------
     */
    const supabase =
      getSupabaseAdmin();

    /*
     * -------------------------------------------------------
     * FIND EXISTING RMX ORDER
     * -------------------------------------------------------
     */
    const {
      data,
      error: orderLookupError,
    } =
      await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            status,
            payment_status,
            size,
            frame,
            lithophane,
            quantity,
            unit_price,
            subtotal,
            discount,
            total,
            razorpay_order_id,
            razorpay_payment_id
          `
        )
        .eq(
          "order_number",
          orderNumber
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
            "Unable to load the RMX order.",
        },
        { status: 500 }
      );
    }

    const existingOrder =
      data as DatabaseOrder | null;

    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          error:
            "RMX order was not found. Please return to review and try again.",
        },
        { status: 404 }
      );
    }

    /*
     * -------------------------------------------------------
     * PREVENT RE-PAYMENT
     * -------------------------------------------------------
     */
    if (
      existingOrder.payment_status ===
        "paid" ||
      existingOrder.status ===
        "confirmed"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order has already been paid.",
        },
        { status: 409 }
      );
    }

    /*
     * -------------------------------------------------------
     * VALIDATE DATABASE PRICING
     * -------------------------------------------------------
     *
     * The database order contains the normal RMX price:
     *
     * subtotal
     * - quantity discount
     * = normal order total
     *
     * The additional prepaid discount is applied ONLY
     * to the online Razorpay payment amount.
     */
    const normalizedSize =
      (
        existingOrder.size ||
        ""
      )
        .trim()
        .toLowerCase();

    const size =
      normalizedSize ===
      "large"
        ? "large"
        : "standard";

    const quantity =
      Math.max(
        1,
        Math.min(
          10,
          Number(
            existingOrder.quantity
          ) || 1
        )
      );

    const expectedUnitPrice =
      SIZE_PRICES[size];

    const expectedSubtotal =
      expectedUnitPrice *
      quantity;

    const expectedDiscount =
      quantity >= 2
        ? Math.round(
            expectedSubtotal *
              0.1
          )
        : 0;

    const expectedTotal =
      expectedSubtotal -
      expectedDiscount;

    /*
     * -------------------------------------------------------
     * PREPAID DISCOUNT
     * -------------------------------------------------------
     *
     * Existing quantity discount is applied first.
     *
     * Then the customer receives an additional 5% discount
     * when choosing online/prepaid payment.
     */
    const prepaidDiscount =
      Math.round(
        expectedTotal *
          PREPAID_DISCOUNT_RATE
      );

    const prepaidTotal =
      expectedTotal -
      prepaidDiscount;

    /*
     * Ensure the order stored in Supabase
     * matches the current RMX pricing rules.
     */
    if (
      Number(
        existingOrder.unit_price
      ) !==
        expectedUnitPrice ||
      Number(
        existingOrder.subtotal
      ) !==
        expectedSubtotal ||
      Number(
        existingOrder.discount
      ) !==
        expectedDiscount ||
      Number(
        existingOrder.total
      ) !==
        expectedTotal
    ) {
      console.error(
        "Supabase order pricing mismatch:",
        {
          orderNumber:
            existingOrder.order_number,
          database: {
            unitPrice:
              existingOrder.unit_price,
            subtotal:
              existingOrder.subtotal,
            discount:
              existingOrder.discount,
            total:
              existingOrder.total,
          },
          expected: {
            unitPrice:
              expectedUnitPrice,
            subtotal:
              expectedSubtotal,
            discount:
              expectedDiscount,
            total:
              expectedTotal,
          },
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Order pricing validation failed. Please return to review and try again.",
        },
        { status: 409 }
      );
    }

    /*
     * -------------------------------------------------------
     * RAZORPAY AMOUNT
     * -------------------------------------------------------
     */
    const amountInPaise =
      Math.round(
        prepaidTotal * 100
      );

    if (
      amountInPaise <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * REUSE EXISTING RAZORPAY ORDER ONLY IF AMOUNT MATCHES
     * -------------------------------------------------------
     *
     * This prevents an older Razorpay order created before
     * the prepaid discount was introduced from charging the
     * old amount.
     */
    if (
      existingOrder.razorpay_order_id
    ) {
      try {
        const razorpay =
          new Razorpay({
            key_id: keyId,
            key_secret:
              keySecret,
          });

        const existingRazorpayOrder =
          await razorpay.orders.fetch(
            existingOrder.razorpay_order_id
          );

        if (
          Number(
            existingRazorpayOrder.amount
          ) ===
          amountInPaise
        ) {
          console.log(
            "Existing Razorpay order found with correct prepaid amount:",
            existingOrder.razorpay_order_id
          );

          return NextResponse.json({
            success: true,

            keyId,

            orderId:
              existingOrder.razorpay_order_id,

            databaseOrderId:
              existingOrder.id,

            orderNumber:
              existingOrder.order_number,

            amount:
              amountInPaise,

            currency:
              "INR",

            size,

            quantity,

            unitPrice:
              expectedUnitPrice,

            subtotal:
              expectedSubtotal,

            discount:
              expectedDiscount,

            total:
              expectedTotal,

            prepaidDiscount,

            prepaidTotal,
          });
        }

        console.log(
          "Existing Razorpay order amount differs from current prepaid amount. Creating a new Razorpay order."
        );
      } catch (existingOrderError) {
        console.error(
          "Unable to inspect existing Razorpay order. A new payment order will be created:",
          existingOrderError
        );
      }
    }

    /*
     * -------------------------------------------------------
     * CREATE RAZORPAY ORDER
     * -------------------------------------------------------
     */
    console.log(
      "Creating Razorpay prepaid order:",
      {
        orderNumber:
          existingOrder.order_number,

        databaseOrderId:
          existingOrder.id,

        size,

        quantity,

        unitPrice:
          expectedUnitPrice,

        subtotal:
          expectedSubtotal,

        quantityDiscount:
          expectedDiscount,

        baseTotal:
          expectedTotal,

        prepaidDiscount,

        prepaidTotal,

        amountInPaise,
      }
    );

    const razorpay =
      new Razorpay({
        key_id: keyId,
        key_secret:
          keySecret,
      });

    const razorpayOrder =
      await razorpay.orders.create(
        {
          amount:
            amountInPaise,

          currency:
            "INR",

          receipt:
            `rmx_${Date.now()}`,

          notes: {
            product:
              "Personalized Lithophane Lamp",

            RMXOrderId:
              existingOrder.order_number,

            databaseOrderId:
              existingOrder.id,

            size,

            quantity:
              String(quantity),

            unitPrice:
              String(
                expectedUnitPrice
              ),

            subtotal:
              String(
                expectedSubtotal
              ),

            quantityDiscount:
              String(
                expectedDiscount
              ),

            baseTotal:
              String(
                expectedTotal
              ),

            prepaidDiscount:
              String(
                prepaidDiscount
              ),

            prepaidTotal:
              String(
                prepaidTotal
              ),

            paymentType:
              "prepaid",
          },
        }
      );

    console.log(
      "Razorpay prepaid order created:",
      razorpayOrder.id
    );

    /*
     * -------------------------------------------------------
     * SAVE RAZORPAY ORDER ID IN SUPABASE
     * -------------------------------------------------------
     */
    const {
      error:
        updateOrderError,
    } =
      await supabase
        .from("orders")
        .update({
          razorpay_order_id:
            razorpayOrder.id,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existingOrder.id
        );

    if (updateOrderError) {
      console.error(
        "Supabase Razorpay order ID update error:",
        updateOrderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to link the payment order to your RMX order. Please try again.",
        },
        { status: 500 }
      );
    }

    /*
     * -------------------------------------------------------
     * RESPONSE
     * -------------------------------------------------------
     */
    return NextResponse.json({
      success: true,

      keyId,

      orderId:
        razorpayOrder.id,

      databaseOrderId:
        existingOrder.id,

      orderNumber:
        existingOrder.order_number,

      amount:
        amountInPaise,

      currency:
        "INR",

      size,

      quantity,

      unitPrice:
        expectedUnitPrice,

      subtotal:
        expectedSubtotal,

      discount:
        expectedDiscount,

      total:
        expectedTotal,

      prepaidDiscount,

      prepaidTotal,
    });
  } catch (error) {
    console.error(
      "Razorpay create-order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}