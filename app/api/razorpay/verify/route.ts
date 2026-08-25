import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

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

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
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

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          keySecret
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const signatureBuffer =
      Buffer.from(generatedSignature);

    const receivedSignatureBuffer =
      Buffer.from(razorpay_signature);

    const isValid =
      signatureBuffer.length ===
        receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(
        signatureBuffer,
        receivedSignatureBuffer
      );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment signature verification failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
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
          "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}