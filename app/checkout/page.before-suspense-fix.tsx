"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ImagePlus,
  ShieldCheck,
  Truck,
  Upload,
  X,
} from "lucide-react";

const sizes = {
  mini: {
    name: "Mini",
    dimensions: "12 × 12 cm",
    price: 1, // TEMPORARY LIVE TEST PRICE
  },
  standard: {
    name: "Standard",
    dimensions: "15 × 15 cm",
    price: 999,
  },
  large: {
    name: "Large",
    dimensions: "20 × 20 cm",
    price: 1399,
  },
  xl: {
    name: "XL",
    dimensions: "25 × 25 cm",
    price: 1899,
  },
} as const;

const lithophaneColors = {
  "natural-white": {
    name: "Natural White",
    description: "Neutral white • maximum detail",
  },
  "warm-white": {
    name: "Warm White",
    description: "Warm white • cozy glow",
  },
} as const;

const frameColors = {
  black: {
    name: "Matte Black",
  },
  grey: {
    name: "Graphite Grey",
  },
} as const;

type SizeId = keyof typeof sizes;
type LithophaneId = keyof typeof lithophaneColors;
type FrameId = keyof typeof frameColors;

export default function CheckoutPage() {
  const params = useSearchParams();

  const rawSizeId = params.get("size") || "standard";
  const rawLithophaneId =
    params.get("lithophane") || "natural-white";
  const rawFrameId = params.get("frame") || "black";

  const sizeId: SizeId =
    rawSizeId in sizes
      ? (rawSizeId as SizeId)
      : "standard";

  const lithophaneId: LithophaneId =
    rawLithophaneId in lithophaneColors
      ? (rawLithophaneId as LithophaneId)
      : "natural-white";

  const frameId: FrameId =
    rawFrameId in frameColors
      ? (rawFrameId as FrameId)
      : "black";

  const size = sizes[sizeId];
  const lithophane = lithophaneColors[lithophaneId];
  const frame = frameColors[frameId];

  const initialQuantity = Math.max(
    1,
    Math.min(
      10,
      Number(params.get("quantity") || 1) || 1
    )
  );

  const [quantity, setQuantity] =
    useState(initialQuantity);

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [error, setError] =
    useState("");

  const [isContinuing, setIsContinuing] =
    useState(false);

  const subtotal = size.price * quantity;

  const discount =
    quantity >= 2
      ? Math.round(subtotal * 0.1)
      : 0;

  const total = subtotal - discount;

  const selectionFolder =
    `${sizeId}-${frameId}-${lithophaneId}`;

  const heroImage =
    `/images/lithophane/${selectionFolder}/01-hero.jpg`;

  const selectionText = useMemo(
    () =>
      `${size.name} • ${lithophane.name} • ${frame.name}`,
    [
      size.name,
      lithophane.name,
      frame.name,
    ]
  );

  const handlePhoto = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Image must be 10 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPhoto(file);

    const nextPreview =
      URL.createObjectURL(file);

    setPreviewUrl(nextPreview);
  };

  const removePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPhoto(null);
    setPreviewUrl("");
    setError("");
  };

  const fileToDataUrl = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(reader.result);
          } else {
            reject(
              new Error(
                "Unable to read image."
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read image."
            )
          );
        };

        reader.readAsDataURL(file);
      }
    );
  };

  const continueToCustomerDetails =
    async () => {
      if (isContinuing) {
        return;
      }

      if (!photo) {
        setError(
          "Please upload your photo before continuing."
        );

        return;
      }

      setError("");
      setIsContinuing(true);

      try {
        const photoDataUrl =
          await fileToDataUrl(photo);

        const orderData = {
          sizeId,
          sizeName: size.name,
          dimensions: size.dimensions,

          frameId,
          frameName: frame.name,

          lithophaneId,
          lithophaneName: lithophane.name,
          lithophaneDescription:
            lithophane.description,

          quantity,

          unitPrice: size.price,

          subtotal,
          discount,
          total,

          photoName: photo.name,
          photoType: photo.type,
          photoSize: photo.size,

          createdAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          "rmx_checkout_config",
          JSON.stringify(orderData)
        );

        localStorage.setItem(
          "rmx_order_details",
          JSON.stringify({
            size: sizeId,
            sizeId,
            sizeName: size.name,
            dimensions: size.dimensions,

            frame: frameId,
            frameId,
            frameName: frame.name,

            lithophane: lithophaneId,
            lithophaneId,
            lithophaneName:
              lithophane.name,

            quantity,

            price: size.price,
            unitPrice: size.price,

            subtotal,
            discount,
            total,
          })
        );

        sessionStorage.setItem(
          "rmx_checkout_order",
          JSON.stringify(orderData)
        );

        localStorage.setItem(
          "rmx_checkout_photo",
          photoDataUrl
        );

        localStorage.setItem(
          "rmx_lithophane_photo",
          photoDataUrl
        );

        localStorage.setItem(
          "lithophanePhoto",
          photoDataUrl
        );

        localStorage.setItem(
          "uploadedPhoto",
          photoDataUrl
        );

        sessionStorage.setItem(
          "rmx_checkout_config",
          JSON.stringify(orderData)
        );

        window.location.href =
          "/checkout/customer-details";
      } catch (storageError) {
        console.error(
          "Unable to save checkout information:",
          storageError
        );

        setError(
          "Unable to save your photo. Please try a smaller image and try again."
        );

        setIsContinuing(false);
      }
    };

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() =>
            window.history.back()
          }
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          <ChevronLeft size={18} />
          Back to product
        </button>

        <div className="mb-10">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-400">
            <ImagePlus size={14} />
            PERSONALIZED ORDER
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Create Your Personalized Lithophane
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Upload your photo, confirm your configuration,
            and continue with your order details.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">

            <div className="mb-6">

              <h2 className="text-xl font-bold">
                1. Upload your photo
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Use a clear, well-lit photo.
                JPG, PNG, or WEBP up to 10 MB.
              </p>

            </div>

            {!previewUrl ? (

              <label className="group flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.03] px-6 text-center transition hover:border-cyan-400/60 hover:bg-cyan-400/[0.06]">

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhoto}
                  className="hidden"
                />

                <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                  <Upload
                    className="text-cyan-400"
                    size={32}
                  />
                </div>

                <p className="text-lg font-bold">
                  Choose your photo
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Click here or drag your image into this area
                </p>

                <span className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition group-hover:bg-cyan-300">
                  SELECT PHOTO
                </span>

              </label>

            ) : (

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">

                <div className="relative aspect-square max-h-[560px]">

                  <img
                    src={previewUrl}
                    alt="Uploaded photo preview"
                    className="h-full w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/80 p-2 text-white backdrop-blur transition hover:bg-white hover:text-black"
                    aria-label="Remove uploaded photo"
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold">
                      {photo?.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Photo ready for personalization
                    </p>

                  </div>

                  <Check
                    className="shrink-0 text-emerald-400"
                    size={20}
                  />

                </div>

              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">

                <ShieldCheck
                  className="mb-2 text-emerald-400"
                  size={20}
                />

                <p className="text-sm font-bold">
                  Secure order
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your details stay private.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">

                <Truck
                  className="mb-2 text-cyan-400"
                  size={20}
                />

                <p className="text-sm font-bold">
                  Fast shipping
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Estimated 2–4 days.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">

                <Check
                  className="mb-2 text-cyan-400"
                  size={20}
                />

                <p className="text-sm font-bold">
                  Made to order
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Printed for you.
                </p>

              </div>

            </div>

          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">

            <h2 className="text-xl font-bold">
              2. Confirm your order
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">

              <div className="aspect-square">

                <img
                  src={
                    previewUrl ||
                    heroImage
                  }
                  alt={
                    previewUrl
                      ? "Your uploaded photo"
                      : "Selected lithophane configuration"
                  }
                  className="h-full w-full object-contain"
                />

              </div>

            </div>

            <p className="mt-3 text-center text-xs text-gray-600">
              {previewUrl
                ? "Your uploaded photo"
                : "Product reference preview"}
            </p>

            <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">

              <p className="text-xs font-semibold tracking-widest text-gray-500">
                YOUR SELECTION
              </p>

              <p className="mt-3 font-bold">
                {selectionText}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {size.dimensions}
              </p>

              <p className="mt-1 text-xs text-gray-600">
                {lithophane.description}
              </p>

            </div>

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-sm font-bold">
                  Quantity
                </span>

                {quantity >= 2 && (
                  <span className="text-xs font-bold text-emerald-400">
                    10% discount applied
                  </span>
                )}

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(
                        1,
                        q - 1
                      )
                    )
                  }
                  className="px-3 text-lg text-gray-400 hover:text-white"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span className="font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(
                        10,
                        q + 1
                      )
                    )
                  }
                  className="px-3 text-lg text-gray-400 hover:text-white"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">

              <div className="flex justify-between text-gray-400">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>

              </div>

              {discount > 0 && (

                <div className="flex justify-between text-emerald-400">

                  <span>
                    10% discount
                  </span>

                  <span>
                    -₹{discount.toLocaleString("en-IN")}
                  </span>

                </div>

              )}

              <div className="flex justify-between pt-2 text-xl font-black">

                <span>
                  Total
                </span>

                <span>
                  ₹{total.toLocaleString("en-IN")}
                </span>

              </div>

            </div>

            <div className="mt-6">

              <button
                type="button"
                onClick={
                  continueToCustomerDetails
                }
                disabled={
                  !photo ||
                  isContinuing
                }
                className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-600"
              >
                {isContinuing
                  ? "SAVING YOUR ORDER..."
                  : "CONTINUE TO CUSTOMER DETAILS"}
              </button>

              {!photo && (
                <p className="mt-3 text-center text-xs text-gray-600">
                  Upload your photo to continue.
                </p>
              )}

              {photo && !isContinuing && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  Continue to enter your delivery details.
                </p>
              )}

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}