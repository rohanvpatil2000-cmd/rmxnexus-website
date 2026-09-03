import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SIZE_PRICES: Record<string, number> = {
  standard: 799,
  large: 1199,
};

const ALLOWED_FRAMES = new Set([
  "black",
  "grey",
]);

const ALLOWED_LITHOPHANES = new Set([
  "natural-white",
  "warm-white",
]);

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

function normalizeSize(value: unknown) {
  const size =
    String(value || "")
      .trim()
      .toLowerCase();

  return size === "large"
    ? "large"
    : "standard";
}

function normalizeFrame(value: unknown) {
  const frame =
    String(value || "")
      .trim()
      .toLowerCase();

  return frame === "grey"
    ? "grey"
    : "black";
}

function normalizeLithophane(value: unknown) {
  const lithophane =
    String(value || "")
      .trim()
      .toLowerCase();

  return lithophane === "warm-white"
    ? "warm-white"
    : "natural-white";
}

function createOrderNumber() {
  const timestamp =
    Date.now().toString(36).toUpperCase();

  const randomPart =
    crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 6)
      .toUpperCase();

  return `RMX-${timestamp}-${randomPart}`;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const customer =
      body?.customer;

    const order =
      body?.order;

    const photo =
      body?.photo;

    if (!customer || !order) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer and order details are required.",
        },
        { status: 400 }
      );
    }

    const customerName =
      String(
        customer.fullName ||
          customer.name ||
          ""
      ).trim();

    const customerMobile =
      String(
        customer.mobile ||
          ""
      ).trim();

    const customerEmail =
      String(
        customer.email ||
          ""
      ).trim();

    const address =
      String(
        customer.address ||
          ""
      ).trim();

    const city =
      String(
        customer.city ||
          ""
      ).trim();

    const state =
      String(
        customer.state ||
          "Maharashtra"
      ).trim();

    const pinCode =
      String(
        customer.pincode ||
          customer.pinCode ||
          ""
      ).trim();

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[6-9]\d{9}$/.test(
        customerMobile
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid 10-digit mobile number is required.",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Delivery address is required.",
        },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          error:
            "City is required.",
        },
        { status: 400 }
      );
    }

    if (!pinCode) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN code is required.",
        },
        { status: 400 }
      );
    }

    const size =
      normalizeSize(order.size);

    const frame =
      normalizeFrame(order.frame);

    const lithophane =
      normalizeLithophane(
        order.lithophane
      );

    const quantity = Math.max(
      1,
      Math.min(
        10,
        Number(order.quantity) || 1
      )
    );

    const unitPrice =
      SIZE_PRICES[size];

    const subtotal =
      unitPrice * quantity;

    const discount =
      quantity >= 2
        ? Math.round(
            subtotal * 0.1
          )
        : 0;

    const total =
      subtotal - discount;

    if (
      !ALLOWED_FRAMES.has(frame)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid frame selection.",
        },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_LITHOPHANES.has(
        lithophane
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid lithophane selection.",
        },
        { status: 400 }
      );
    }

    const storagePath =
      String(
        photo?.storagePath ||
          ""
      ).trim();

    if (!storagePath) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Uploaded photo is not available.",
        },
        { status: 400 }
      );
    }

    if (
      !storagePath.startsWith(
        "orders/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid photo storage path.",
        },
        { status: 400 }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const orderNumber =
      createOrderNumber();

    const {
      data: createdOrder,
      error: orderError,
    } =
      await supabase
        .from("orders")
        .insert({
          order_number:
            orderNumber,

          status:
            "pending",

          payment_status:
            "pending",

          customer_name:
            customerName,

          customer_mobile:
            customerMobile,

          customer_email:
            customerEmail || null,

          address,

          city,

          state,

          pin_code:
            pinCode,

          product_name:
            "Personalized Lithophane",

          size,

          frame,

          lithophane,

          quantity,

          unit_price:
            unitPrice,

          subtotal,

          discount,

          total,
        })
        .select(
          "id, order_number, status, payment_status"
        )
        .single();

    if (orderError) {
      console.error(
        "Supabase order creation error:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to create your order.",
        },
        { status: 500 }
      );
    }

    const {
      data: createdPhoto,
      error: photoError,
    } =
      await supabase
        .from("order_photos")
        .insert({
          order_id:
            createdOrder.id,

          photo_index:
            1,

          storage_path:
            storagePath,

          original_name:
            String(
              photo?.originalName ||
                ""
            ),

          mime_type:
            String(
              photo?.mimeType ||
                ""
            ),

          file_size:
            Number(
              photo?.fileSize || 0
            ),
        })
        .select(
          "id, order_id, photo_index, storage_path"
        )
        .single();

    if (photoError) {
      console.error(
        "Supabase order photo creation error:",
        photoError
      );

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          createdOrder.id
        );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to link your uploaded photo to the order.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      orderId:
        createdOrder.id,

      orderNumber:
        createdOrder.order_number,

      status:
        createdOrder.status,

      paymentStatus:
        createdOrder.payment_status,

      photoId:
        createdPhoto.id,

      photoStoragePath:
        createdPhoto.storage_path,

      size,

      frame,

      lithophane,

      quantity,

      unitPrice,

      subtotal,

      discount,

      total,
    });
  } catch (error) {
    console.error(
      "Create order API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create your order.",
      },
      { status: 500 }
    );
  }
}