import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SIZE_PRICES: Record<string, number> = {
  standard: 1,
  large: 1,
};

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
     * Example:
     * RMX-MTLM05ON-286060
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
     *
     * This is the order created by:
     *
     * /api/orders/create
     *
     * The database is now the source of truth.
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

    /*
     * Explicitly type the returned database
     * record so TypeScript does not incorrectly
     * infer the Supabase result as GenericStringError.
     */
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
     * The amount used for Razorpay is calculated again
     * from the database values.
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
     * REUSE EXISTING RAZORPAY ORDER
     * -------------------------------------------------------
     *
     * If Razorpay order creation already happened for
     * this RMX order but payment was not completed,
     * reuse the same Razorpay order.
     */
    if (
      existingOrder.razorpay_order_id
    ) {
      console.log(
        "Existing Razorpay order found:",
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
          Math.round(
            expectedTotal * 100
          ),
        currency: "INR",
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
      });
    }

    /*
     * -------------------------------------------------------
     * CREATE RAZORPAY ORDER
     * -------------------------------------------------------
     */
    const amountInPaise =
      Math.round(
        expectedTotal * 100
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

    console.log(
      "Creating Razorpay order:",
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
        discount:
          expectedDiscount,
        total:
          expectedTotal,
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

            discount:
              String(
                expectedDiscount
              ),

            total:
              String(
                expectedTotal
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

      /*
       * We intentionally do not silently create another
       * Razorpay order. The response tells the customer
       * that the order could not be prepared safely.
       */
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
