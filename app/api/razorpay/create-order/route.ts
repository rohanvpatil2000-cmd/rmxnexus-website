import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const SIZE_PRICES: Record<
  string,
  number
> = {
  /*
   * TEMPORARY LIVE TEST
   * Mini = ₹1
   */
  mini: 1,

  standard: 999,

  large: 1399,

  xl: 1899,
};

function normalizeSize(
  value: string | undefined
) {
  const normalized =
    (value || "")
      .trim()
      .toLowerCase();

  if (
    normalized ===
    "mini"
  ) {
    return "mini";
  }

  if (
    normalized ===
    "large"
  ) {
    return "large";
  }

  if (
    normalized ===
    "xl"
  ) {
    return "xl";
  }

  return "standard";
}

export async function POST(
  request: Request
) {
  try {
    /*
     * -------------------------------------------------------
     * ENVIRONMENT VARIABLES
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
        {
          status: 500,
        }
      );
    }

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Razorpay secret key is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * READ REQUEST
     * -------------------------------------------------------
     */
    const body =
      await request.json();

    const size =
      normalizeSize(
        body?.size
      );

    const quantity =
      Math.max(
        1,
        Math.min(
          10,
          Number(
            body?.quantity
          ) || 1
        )
      );

    /*
     * -------------------------------------------------------
     * CALCULATE PRICE
     * -------------------------------------------------------
     */
    const unitPrice =
      SIZE_PRICES[size];

    const subtotal =
      unitPrice *
      quantity;

    const discount =
      quantity >= 2
        ? Math.round(
            subtotal * 0.1
          )
        : 0;

    const total =
      subtotal -
      discount;

    /*
     * Razorpay uses paise.
     *
     * ₹1 = 100 paise
     */
    const amountInPaise =
      Math.round(
        total * 100
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
        {
          status: 400,
        }
      );
    }

    console.log(
      "Creating Razorpay order:",
      {
        size,
        quantity,
        unitPrice,
        subtotal,
        discount,
        total,
        amountInPaise,
      }
    );

    /*
     * -------------------------------------------------------
     * RAZORPAY CLIENT
     * -------------------------------------------------------
     */
    const razorpay =
      new Razorpay({
        key_id:
          keyId,

        key_secret:
          keySecret,
      });

    /*
     * -------------------------------------------------------
     * CREATE ORDER
     * -------------------------------------------------------
     */
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

            size,

            quantity:
              String(
                quantity
              ),

            unitPrice:
              String(
                unitPrice
              ),

            subtotal:
              String(
                subtotal
              ),

            discount:
              String(
                discount
              ),

            total:
              String(
                total
              ),
          },
        }
      );

    console.log(
      "Razorpay order created:",
      razorpayOrder.id
    );

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

      amount:
        amountInPaise,

      currency:
        "INR",

      size,

      quantity,

      unitPrice,

      subtotal,

      discount,

      total,
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
      {
        status: 500,
      }
    );
  }
}