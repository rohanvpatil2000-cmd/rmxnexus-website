import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
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

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No image file was provided.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only JPG, PNG, and WEBP images are supported.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image is too large. Maximum size is 10 MB.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
        ? "png"
        : "webp";

    const uniqueId =
      `${Date.now()}-${crypto.randomUUID()}`;

    const storagePath =
      `orders/${uniqueId}.${extension}`;

    const fileBuffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    const supabase =
      getSupabaseAdmin();

    const { error } =
      await supabase.storage
        .from("customer-uploads")
        .upload(
          storagePath,
          fileBuffer,
          {
            contentType:
              file.type,
            upsert: false,
          }
        );

    if (error) {
      console.error(
        "Supabase Storage upload error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to save the uploaded image.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      storagePath,
      originalName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error(
      "Customer photo upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload image.",
      },
      { status: 500 }
    );
  }
}