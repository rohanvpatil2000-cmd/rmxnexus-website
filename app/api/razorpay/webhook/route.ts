import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

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

export async function POST(
  request: Request
) {
  try {
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

    const rawBody =
      await request.text();

    const valid =
      verifyWebhookSignature(
        rawBody,
        signature,
        webhookSecret
      );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid Razorpay webhook signature.",
        },
        { status: 400 }
      );
    }

    const event =
      JSON.parse(rawBody);

    console.log(
      "Verified Razorpay webhook:",
      event.event
    );

    if (
      event.event ===
      "payment.captured"
    ) {
      const payment =
        event?.payload?.payment?.entity;

      console.log(
        "RMX payment captured:",
        {
          paymentId:
            payment?.id,
          orderId:
            payment?.order_id,
          amount:
            payment?.amount,
          currency:
            payment?.currency,
          status:
            payment?.status,
        }
      );
    }

    if (
      event.event ===
      "order.paid"
    ) {
      const order =
        event?.payload?.order?.entity;

      console.log(
        "RMX order paid:",
        {
          orderId:
            order?.id,
          amount:
            order?.amount,
          amountPaid:
            order?.amount_paid,
          currency:
            order?.currency,
          status:
            order?.status,
        }
      );
    }

    if (
      event.event ===
      "payment.failed"
    ) {
      const payment =
        event?.payload?.payment?.entity;

      console.log(
        "RMX payment failed:",
        {
          paymentId:
            payment?.id,
          orderId:
            payment?.order_id,
          errorCode:
            payment?.error_code,
          errorDescription:
            payment?.error_description,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}