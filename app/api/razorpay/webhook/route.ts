import { NextResponse } from "next/server";
import crypto from "crypto";
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

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

type RazorpayOrderEntity = {
  id?: string;
  amount?: number;
  amount_paid?: number;
  currency?: string;
  status?: string;
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

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(rawBody)
      .digest("hex");

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "utf8"
    );

  const receivedBuffer =
    Buffer.from(
      signature,
      "utf8"
    );

  if (
    expectedBuffer.length !==
    receivedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

async function findOrderByRazorpayOrderId(
  supabase: ReturnType<
    typeof getSupabaseAdmin
  >,
  razorpayOrderId: string
): Promise<DatabaseOrder | null> {
  const {
    data,
    error,
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
        razorpayOrderId
      )
      .maybeSingle();

  if (error) {
    console.error(
      "Supabase webhook order lookup error:",
      error
    );

    throw new Error(
      "Unable to find the RMX order."
    );
  }

  return data as DatabaseOrder | null;
}

async function markOrderAsPaid(
  supabase: ReturnType<
    typeof getSupabaseAdmin
  >,
  order: DatabaseOrder,
  paymentId: string
) {
  /*
   * -------------------------------------------------------
   * IDEMPOTENCY
   * -------------------------------------------------------
   *
   * If the order is already paid with the same payment,
   * there is nothing else to do.
   */
  if (
    order.payment_status ===
      "paid" &&
    order.status ===
      "paid" &&
    order.razorpay_payment_id ===
      paymentId
  ) {
    console.log(
      "Webhook payment already processed:",
      {
        orderNumber:
          order.order_number,
        paymentId,
      }
    );

    return {
      alreadyProcessed: true,
    };
  }

  /*
   * -------------------------------------------------------
   * PREVENT DIFFERENT PAYMENT FROM REPLACING
   * AN ALREADY PAID ORDER
   * -------------------------------------------------------
   */
  if (
    order.payment_status ===
      "paid" ||
    order.status ===
      "paid"
  ) {
    console.warn(
      "RMX order is already paid with another payment:",
      {
        orderNumber:
          order.order_number,
        existingPaymentId:
          order.razorpay_payment_id,
        incomingPaymentId:
          paymentId,
      }
    );

    return {
      alreadyProcessed: true,
    };
  }

  /*
   * -------------------------------------------------------
   * UPDATE SUPABASE
   * -------------------------------------------------------
   *
   * The existing orders_status_check constraint
   * allows "paid".
   *
   * Therefore:
   *
   * status = paid
   * payment_status = paid
   */
  const {
    data,
    error,
  } =
    await supabase
      .from("orders")
      .update({
        status:
          "paid",

        payment_status:
          "paid",

        razorpay_payment_id:
          paymentId,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        order.id
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

  if (error) {
    console.error(
      "Supabase webhook payment update error:",
      error
    );

    throw new Error(
      "Unable to update the RMX order."
    );
  }

  const updatedOrder =
    data as DatabaseOrder | null;

  if (!updatedOrder) {
    throw new Error(
      "Supabase webhook update returned no order."
    );
  }

  console.log(
    "RMX order marked as paid by webhook:",
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

  return {
    alreadyProcessed: false,
    order:
      updatedOrder,
  };
}

export async function POST(
  request: Request
) {
  try {
    /*
     * -------------------------------------------------------
     * WEBHOOK SECRET
     * -------------------------------------------------------
     */
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Webhook secret is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * -------------------------------------------------------
     * SIGNATURE
     * -------------------------------------------------------
     */
    const signature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing Razorpay webhook signature.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * RAW BODY
     * -------------------------------------------------------
     *
     * The raw request body must be used for webhook
     * signature verification.
     */
    const rawBody =
      await request.text();

    /*
     * -------------------------------------------------------
     * VERIFY SIGNATURE
     * -------------------------------------------------------
     */
    const valid =
      verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      );

    if (!valid) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Razorpay webhook signature.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Razorpay webhook signature verified."
    );

    /*
     * -------------------------------------------------------
     * PARSE EVENT
     * -------------------------------------------------------
     */
    let event: {
      event?: string;
      payload?: {
        payment?: {
          entity?: RazorpayPaymentEntity;
        };
        order?: {
          entity?: RazorpayOrderEntity;
        };
      };
    };

    try {
      event =
        JSON.parse(
          rawBody
        );
    } catch (parseError) {
      console.error(
        "Unable to parse Razorpay webhook JSON:",
        parseError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid webhook payload.",
        },
        { status: 400 }
      );
    }

    console.log(
      "Verified Razorpay webhook:",
      event.event
    );

    /*
     * -------------------------------------------------------
     * ONLY PROCESS EVENTS WE NEED
     * -------------------------------------------------------
     *
     * Successful payment events:
     *
     * payment.captured
     * order.paid
     *
     * Other Razorpay events are acknowledged without
     * modifying the RMX order.
     */
    if (
      event.event !==
        "payment.captured" &&
      event.event !==
        "order.paid"
    ) {
      console.log(
        "Razorpay webhook acknowledged without database update:",
        event.event
      );

      return NextResponse.json({
        success: true,
        processed: false,
        event:
          event.event ||
          null,
      });
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
     * PAYMENT.CAPTURED
     * -------------------------------------------------------
     */
    if (
      event.event ===
      "payment.captured"
    ) {
      const payment =
        event?.payload?.payment
          ?.entity;

      const razorpayOrderId =
        payment?.order_id;

      const paymentId =
        payment?.id;

      const paymentAmount =
        payment?.amount;

      const paymentCurrency =
        payment?.currency;

      const paymentStatus =
        payment?.status;

      console.log(
        "Razorpay payment.captured:",
        {
          paymentId,
          razorpayOrderId,
          paymentAmount,
          paymentCurrency,
          paymentStatus,
        }
      );

      /*
       * Validate required Razorpay data.
       */
      if (
        !razorpayOrderId ||
        !paymentId
      ) {
        console.error(
          "payment.captured webhook is missing order/payment ID."
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Incomplete payment.captured webhook.",
          },
          { status: 400 }
        );
      }

      /*
       * Require the payment itself to be captured.
       */
      if (
        paymentStatus &&
        paymentStatus !==
          "captured"
      ) {
        console.warn(
          "Ignoring payment.captured event with unexpected status:",
          paymentStatus
        );

        return NextResponse.json({
          success: true,
          processed: false,
        });
      }

      /*
       * Require INR.
       */
      if (
        paymentCurrency &&
        paymentCurrency !==
          "INR"
      ) {
        console.error(
          "Ignoring webhook with unexpected currency:",
          paymentCurrency
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
       * Find matching RMX order.
       */
      const order =
        await findOrderByRazorpayOrderId(
          supabase,
          razorpayOrderId
        );

      if (!order) {
        /*
         * The webhook may arrive for a Razorpay order
         * that was not created by RMX.
         *
         * Do not modify anything.
         */
        console.warn(
          "No RMX order found for Razorpay webhook:",
          razorpayOrderId
        );

        return NextResponse.json({
          success: true,
          processed: false,
          reason:
            "RMX order not found.",
        });
      }

      /*
       * -----------------------------------------------------
       * VERIFY WEBHOOK AMOUNT AGAINST RMX ORDER
       * -----------------------------------------------------
       */
      const expectedAmountInPaise =
        Math.round(
          Number(
            order.total
          ) * 100
        );

      if (
        typeof paymentAmount ===
          "number" &&
        paymentAmount !==
          expectedAmountInPaise
      ) {
        console.error(
          "Webhook payment amount mismatch:",
          {
            orderNumber:
              order.order_number,

            expectedAmountInPaise,

            receivedAmountInPaise:
              paymentAmount,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Webhook payment amount does not match the RMX order.",
          },
          { status: 400 }
        );
      }

      /*
       * Mark order paid.
       */
      const result =
        await markOrderAsPaid(
          supabase,
          order,
          paymentId
        );

      return NextResponse.json({
        success: true,
        processed:
          !result.alreadyProcessed,
        event:
          event.event,
        orderNumber:
          order.order_number,
        paymentId,
      });
    }

    /*
     * -------------------------------------------------------
     * ORDER.PAID
     * -------------------------------------------------------
     */
    if (
      event.event ===
      "order.paid"
    ) {
      const razorpayOrder =
        event?.payload?.order
          ?.entity;

      const razorpayOrderId =
        razorpayOrder?.id;

      const orderAmount =
        razorpayOrder?.amount;

      const amountPaid =
        razorpayOrder?.amount_paid;

      const orderCurrency =
        razorpayOrder?.currency;

      const orderStatus =
        razorpayOrder?.status;

      console.log(
        "Razorpay order.paid:",
        {
          razorpayOrderId,
          orderAmount,
          amountPaid,
          orderCurrency,
          orderStatus,
        }
      );

      /*
       * Validate Razorpay order ID.
       */
      if (!razorpayOrderId) {
        console.error(
          "order.paid webhook is missing Razorpay order ID."
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Incomplete order.paid webhook.",
          },
          { status: 400 }
        );
      }

      /*
       * Require paid order status when Razorpay provides it.
       */
      if (
        orderStatus &&
        orderStatus !==
          "paid"
      ) {
        console.warn(
          "Ignoring order.paid event with unexpected status:",
          orderStatus
        );

        return NextResponse.json({
          success: true,
          processed: false,
        });
      }

      /*
       * Require INR.
       */
      if (
        orderCurrency &&
        orderCurrency !==
          "INR"
      ) {
        console.error(
          "Ignoring order.paid webhook with unexpected currency:",
          orderCurrency
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid order currency.",
          },
          { status: 400 }
        );
      }

      /*
       * Find matching RMX order.
       */
      const order =
        await findOrderByRazorpayOrderId(
          supabase,
          razorpayOrderId
        );

      if (!order) {
        console.warn(
          "No RMX order found for Razorpay order.paid webhook:",
          razorpayOrderId
        );

        return NextResponse.json({
          success: true,
          processed: false,
          reason:
            "RMX order not found.",
        });
      }

      /*
       * -----------------------------------------------------
       * VERIFY ORDER AMOUNT
       * -----------------------------------------------------
       */
      const expectedAmountInPaise =
        Math.round(
          Number(
            order.total
          ) * 100
        );

      /*
       * Verify the Razorpay order amount if available.
       */
      if (
        typeof orderAmount ===
          "number" &&
        orderAmount !==
          expectedAmountInPaise
      ) {
        console.error(
          "Webhook order amount mismatch:",
          {
            orderNumber:
              order.order_number,

            expectedAmountInPaise,

            receivedAmountInPaise:
              orderAmount,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Webhook order amount does not match the RMX order.",
          },
          { status: 400 }
        );
      }

      /*
       * If Razorpay provides amount_paid, ensure the
       * entire RMX order amount was paid.
       */
      if (
        typeof amountPaid ===
          "number" &&
        amountPaid !==
          expectedAmountInPaise
      ) {
        console.error(
          "Webhook amount_paid mismatch:",
          {
            orderNumber:
              order.order_number,

            expectedAmountInPaise,

            receivedAmountPaid:
              amountPaid,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Webhook paid amount does not match the RMX order.",
          },
          { status: 400 }
        );
      }

      /*
       * -----------------------------------------------------
       * ORDER.PAID DOES NOT ALWAYS NEED A PAYMENT ID
       * -----------------------------------------------------
       *
       * If payment.captured has already processed the
       * payment, the order is already paid.
       *
       * If order.paid arrives first and the payload does
       * not contain a payment entity, we acknowledge it
       * without inventing a payment ID.
       *
       * payment.captured is responsible for storing the
       * actual pay_... ID.
       */
      if (
        order.payment_status ===
          "paid" ||
        order.status ===
          "paid"
      ) {
        console.log(
          "RMX order already marked paid:",
          order.order_number
        );

        return NextResponse.json({
          success: true,
          processed: false,
          event:
            event.event,
          orderNumber:
            order.order_number,
        });
      }

      const paymentFromPayload =
        event?.payload?.payment
          ?.entity;

      const paymentId =
        paymentFromPayload?.id;

      if (!paymentId) {
        console.log(
          "order.paid received before payment.captured; acknowledging without database payment update.",
          {
            orderNumber:
              order.order_number,
            razorpayOrderId,
          }
        );

        return NextResponse.json({
          success: true,
          processed: false,
          event:
            event.event,
          orderNumber:
            order.order_number,
          reason:
            "Waiting for payment.captured payment ID.",
        });
      }

      /*
       * If a payment entity is present, make sure it belongs
       * to this Razorpay order.
       */
      if (
        paymentFromPayload.order_id &&
        paymentFromPayload.order_id !==
          razorpayOrderId
      ) {
        console.error(
          "order.paid payment/order mismatch:",
          {
            paymentOrderId:
              paymentFromPayload.order_id,
            razorpayOrderId,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Webhook payment does not belong to this order.",
          },
          { status: 400 }
        );
      }

      /*
       * Mark order paid.
       */
      const result =
        await markOrderAsPaid(
          supabase,
          order,
          paymentId
        );

      return NextResponse.json({
        success: true,
        processed:
          !result.alreadyProcessed,
        event:
          event.event,
        orderNumber:
          order.order_number,
        paymentId,
      });
    }

    /*
     * This should never be reached because unsupported
     * events were returned above.
     */
    return NextResponse.json({
      success: true,
      processed: false,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook processing error:",
      error
    );

    /*
     * Returning a 500 tells Razorpay that processing failed.
     * Razorpay can then retry the webhook.
     */
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}