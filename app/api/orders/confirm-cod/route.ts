import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
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
    const body = await request.json();

    const databaseOrderId =
      typeof body?.databaseOrderId ===
      "string"
        ? body.databaseOrderId.trim()
        : "";

    const orderNumber =
      typeof body?.orderNumber ===
      "string"
        ? body.orderNumber.trim()
        : "";

    if (!databaseOrderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Database order ID is required.",
        },
        { status: 400 }
      );
    }

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

    const supabase =
      getSupabaseAdmin();

    /*
     * -------------------------------------------------------
     * LOAD THE EXACT ORDER
     * -------------------------------------------------------
     *
     * Both the database UUID and customer-facing RMX
     * order number must match the same row.
     */
    const {
      data,
      error: fetchError,
    } = await supabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          razorpay_order_id,
          razorpay_payment_id
        `
      )
      .eq(
        "id",
        databaseOrderId
      )
      .eq(
        "order_number",
        orderNumber
      )
      .maybeSingle();

    if (fetchError) {
      console.error(
        "COD order lookup error:",
        fetchError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify the order.",
        },
        { status: 500 }
      );
    }

    const order =
      data as OrderRow | null;

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order could not be verified.",
        },
        { status: 404 }
      );
    }

    /*
     * -------------------------------------------------------
     * IDEMPOTENT COD CONFIRMATION
     * -------------------------------------------------------
     *
     * If the same COD order was already confirmed,
     * safely return the existing state.
     */
    if (
      order.payment_method ===
        "cod" &&
      order.payment_status ===
        "pending" &&
      order.status ===
        "pending"
    ) {
      return NextResponse.json({
        success: true,
        message:
          "Cash on Delivery order is already confirmed.",
        databaseOrderId:
          order.id,
        orderNumber:
          order.order_number,
        status:
          order.status,
        paymentStatus:
          order.payment_status,
        paymentMethod:
          order.payment_method,
      });
    }

    /*
     * -------------------------------------------------------
     * COD IS ONLY AVAILABLE BEFORE PAYMENT
     * -------------------------------------------------------
     */
    if (
      order.payment_status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order is no longer awaiting payment.",
        },
        { status: 409 }
      );
    }

    if (
      order.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This order is no longer available for Cash on Delivery.",
        },
        { status: 409 }
      );
    }

    /*
     * If a Razorpay order or payment already exists,
     * this order has entered the online-payment flow.
     */
    if (
      order.razorpay_order_id ||
      order.razorpay_payment_id
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Online payment has already been started for this order.",
        },
        { status: 409 }
      );
    }

    /*
     * -------------------------------------------------------
     * CONFIRM COD
     * -------------------------------------------------------
     *
     * COD means:
     *
     * payment_method = cod
     * status         = pending
     * payment_status = pending
     *
     * No payment is marked as paid.
     */
    const {
      data: updatedData,
      error: updateError,
    } = await supabase
      .from("orders")
      .update({
        payment_method:
          "cod",
        status:
          "pending",
        payment_status:
          "pending",
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        order.id
      )
      .eq(
        "order_number",
        order.order_number
      )
      .eq(
        "payment_status",
        "pending"
      )
      .select(
        `
          id,
          order_number,
          status,
          payment_status,
          payment_method
        `
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "COD confirmation update error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to confirm Cash on Delivery order.",
        },
        { status: 500 }
      );
    }

    if (!updatedData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The order changed before COD confirmation could be completed.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Cash on Delivery order confirmed.",
      databaseOrderId:
        updatedData.id,
      orderNumber:
        updatedData.order_number,
      status:
        updatedData.status,
      paymentStatus:
        updatedData.payment_status,
      paymentMethod:
        updatedData.payment_method,
    });
  } catch (error) {
    console.error(
      "COD confirmation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to confirm Cash on Delivery order.",
      },
      { status: 500 }
    );
  }
}