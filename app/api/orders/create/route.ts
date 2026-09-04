import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type CustomerInput = {
  fullName?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type OrderInput = {
  size?: string;
  frame?: string;
  lithophane?: string;
  quantity?: number;
};

type PhotoInput = {
  storagePath?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
};

const SIZE_PRICES: Record<string, number> = {
  standard: 799,
  large: 1199,
};

function normalizeSize(value: string | undefined): string {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "large") {
    return "large";
  }

  return "standard";
}

function normalizeFrame(value: string | undefined): string {
  const normalized = (value || "").trim().toLowerCase();

  if (
    normalized === "grey" ||
    normalized === "gray" ||
    normalized === "graphite grey" ||
    normalized === "graphite gray" ||
    normalized === "classic grey"
  ) {
    return "grey";
  }

  return "black";
}

function normalizeLithophane(value: string | undefined): string {
  const normalized = (value || "").trim().toLowerCase();

  if (
    normalized === "warm-white" ||
    normalized === "warm white"
  ) {
    return "warm-white";
  }

  return "natural-white";
}

function cleanText(value: string | undefined): string {
  return (value || "").trim();
}

function generateOrderNumber(): string {
  const timestampPart =
    Date.now().toString(36).toUpperCase();

  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase();

  return `RMX-${timestampPart}-${randomPart}`;
}

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

    const customer =
      (body?.customer || {}) as CustomerInput;

    const order =
      (body?.order || {}) as OrderInput;

    const rawPhotos =
      body?.photos;

    /*
     * =====================================================
     * CUSTOMER VALIDATION
     * =====================================================
     */

    const fullName =
      cleanText(customer.fullName);

    const mobile =
      cleanText(customer.mobile);

    const email =
      cleanText(customer.email);

    const address =
      cleanText(customer.address);

    const city =
      cleanText(customer.city);

    const state =
      cleanText(customer.state);

    const pincode =
      cleanText(customer.pincode);

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Mobile number is required.",
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

    if (!state) {
      return NextResponse.json(
        {
          success: false,
          error:
            "State is required.",
        },
        { status: 400 }
      );
    }

    if (!pincode) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PIN code is required.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * ORDER NORMALIZATION
     * =====================================================
     */

    const size =
      normalizeSize(order.size);

    const frame =
      normalizeFrame(order.frame);

    const lithophane =
      normalizeLithophane(
        order.lithophane
      );

    const quantity =
      Number(order.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quantity must be an integer between 1 and 10.",
        },
        { status: 400 }
      );
    }

    /*
     * =====================================================
     * SERVER-SIDE PRICING
     * =====================================================
     */

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

    /*
     * =====================================================
     * MULTI-PHOTO VALIDATION
     * =====================================================
     */

    if (!Array.isArray(rawPhotos)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Photos are required.",
        },
        { status: 400 }
      );
    }

    const photos =
      rawPhotos as PhotoInput[];

    if (
      photos.length !==
      quantity
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Exactly ${quantity} photo${
              quantity === 1
                ? ""
                : "s"
            } is required for quantity ${quantity}.`,
        },
        { status: 400 }
      );
    }

    /*
     * Validate every uploaded photo before creating the
     * database order.
     */

    for (
      let index = 0;
      index < photos.length;
      index++
    ) {
      const photo =
        photos[index];

      const storagePath =
        cleanText(
          photo?.storagePath
        );

      if (!storagePath) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Photo ${index + 1} is missing its storage path.`,
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
              `Photo ${index + 1} has an invalid storage path.`,
          },
          { status: 400 }
        );
      }

      const mimeType =
        cleanText(
          photo?.mimeType
        );

      if (
        mimeType &&
        ![
          "image/jpeg",
          "image/png",
          "image/webp",
        ].includes(mimeType)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Photo ${index + 1} has an unsupported image type.`,
          },
          { status: 400 }
        );
      }

      const fileSize =
        Number(
          photo?.fileSize
        );

      if (
        !Number.isFinite(
          fileSize
        ) ||
        fileSize <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Photo ${index + 1} has an invalid file size.`,
          },
          { status: 400 }
        );
      }

      if (
        fileSize >
        10 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Photo ${index + 1} exceeds the 10MB limit.`,
          },
          { status: 400 }
        );
      }
    }

    /*
     * =====================================================
     * SUPABASE ADMIN CLIENT
     * =====================================================
     */

    const supabase =
      getSupabaseAdmin();

    /*
     * =====================================================
     * CUSTOMER-FACING ORDER NUMBER
     * =====================================================
     */

    const orderNumber =
      generateOrderNumber();

    /*
     * =====================================================
     * CREATE ORDER
     * =====================================================
     *
     * payment_method is explicitly "online" here because
     * this order is created before the payment-method
     * selection. COD will securely change it later through
     * /api/orders/confirm-cod.
     */

    const {
      data: createdOrder,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        order_number:
          orderNumber,

        status:
          "pending",

        payment_status:
          "pending",

        payment_method:
          "online",

        customer_name:
          fullName,

        customer_mobile:
          mobile,

        customer_email:
          email || null,

        address,

        city,

        state,

        pin_code:
          pincode,

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
        "id,order_number,status,payment_status,payment_method"
      )
      .single();

    if (
      orderError ||
      !createdOrder
    ) {
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

    /*
     * =====================================================
     * CREATE ONE ORDER_PHOTOS ROW PER PHOTO
     * =====================================================
     */

    const photoRows =
      photos.map(
        (
          photo,
          index
        ) => ({
          order_id:
            createdOrder.id,

          photo_index:
            index + 1,

          storage_path:
            cleanText(
              photo.storagePath
            ),

          original_name:
            cleanText(
              photo.originalName
            ) || null,

          mime_type:
            cleanText(
              photo.mimeType
            ) || null,

          file_size:
            Number(
              photo.fileSize
            ),
        })
      );

    const {
      data: createdPhotos,
      error: photosError,
    } = await supabase
      .from("order_photos")
      .insert(
        photoRows
      )
      .select(
        "id,photo_index,storage_path,original_name,mime_type,file_size"
      );

    /*
     * =====================================================
     * ROLLBACK ORDER IF PHOTO INSERT FAILS
     * =====================================================
     */

    if (
      photosError ||
      !createdPhotos ||
      createdPhotos.length !==
        quantity
    ) {
      console.error(
        "Supabase order_photos creation error:",
        photosError
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
            "Unable to attach all customer photos to the order. The order was not created.",
        },
        { status: 500 }
      );
    }

    /*
     * =====================================================
     * SORT PHOTO RESPONSE BY PHOTO INDEX
     * =====================================================
     */

    const sortedPhotos =
      [...createdPhotos].sort(
        (a, b) =>
          Number(
            a.photo_index
          ) -
          Number(
            b.photo_index
          )
      );

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     *
     * Keep photoId/photoStoragePath for compatibility with
     * the existing payment flow while also returning the
     * complete photos array.
     */

    return NextResponse.json(
      {
        success: true,

        orderId:
          createdOrder.id,

        orderNumber:
          createdOrder.order_number,

        status:
          createdOrder.status,

        paymentStatus:
          createdOrder.payment_status,

        paymentMethod:
          createdOrder.payment_method,

        photoId:
          sortedPhotos[0]?.id ||
          null,

        photoStoragePath:
          sortedPhotos[0]
            ?.storage_path ||
          null,

        photos:
          sortedPhotos.map(
            (photo) => ({
              id:
                photo.id,

              photoIndex:
                photo.photo_index,

              storagePath:
                photo.storage_path,

              originalName:
                photo.original_name,

              mimeType:
                photo.mime_type,

              fileSize:
                photo.file_size,
            })
          ),

        pricing: {
          unitPrice,
          subtotal,
          discount,
          total,
        },
      },
      { status: 200 }
    );
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