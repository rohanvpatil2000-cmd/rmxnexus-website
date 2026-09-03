"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  standard: {
    name: "11.2 cm",
    dimensions: "11.2 × 11.2 cm",
    price: 799,
  },
  large: {
    name: "16.7 cm",
    dimensions: "16.7 × 16.7 cm",
    price: 1199,
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
type LithophaneId =
  keyof typeof lithophaneColors;
type FrameId =
  keyof typeof frameColors;

type UploadedPhotoInfo = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
};

type PhotoSlot = {
  file: File | null;
  previewUrl: string;
  uploaded: UploadedPhotoInfo | null;
};

type PersistedPhoto = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  preview: string;
};

export default function CheckoutPage() {
  const params = useSearchParams();

  const rawSizeId =
    params.get("size") || "standard";

  const rawLithophaneId =
    params.get("lithophane") ||
    "natural-white";

  const rawFrameId =
    params.get("frame") || "black";

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
  const lithophane =
    lithophaneColors[lithophaneId];
  const frame =
    frameColors[frameId];

  const initialQuantity = Math.max(
    1,
    Math.min(
      10,
      Number(
        params.get("quantity") || 1
      ) || 1
    )
  );

  const [
    quantity,
    setQuantity,
  ] = useState(
    initialQuantity
  );

  const [
    photos,
    setPhotos,
  ] = useState<PhotoSlot[]>(
    () =>
      Array.from(
        {
          length:
            initialQuantity,
        },
        () => ({
          file: null,
          previewUrl: "",
          uploaded: null,
        })
      )
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    isContinuing,
    setIsContinuing,
  ] = useState(false);

  const subtotal =
    size.price * quantity;

  const discount =
    quantity >= 2
      ? Math.round(
          subtotal * 0.1
        )
      : 0;

  const total =
    subtotal - discount;

  const heroImage =
    sizeId === "large"
      ? "/images/lithophane/large/RMX_LARGE_16.7cm_01.jpg"
      : "/images/lithophane/standard/RMX_STANDARD_11.2cm_01.jpg";

  const selectionText =
    useMemo(
      () =>
        `${size.name} • ${lithophane.name} • ${frame.name}`,
      [
        size.name,
        lithophane.name,
        frame.name,
      ]
    );

  const uploadedCount =
    photos.filter(
      (slot) =>
        Boolean(
          slot.file ||
            slot.uploaded
        )
    ).length;

  const allPhotosReady =
    photos.length === quantity &&
    photos.every(
      (slot) =>
        Boolean(slot.file)
    );

  /*
   * =====================================================
   * CLEANUP OBJECT URLS
   * =====================================================
   */

  useEffect(() => {
    return () => {
      photos.forEach(
        (slot) => {
          if (
            slot.previewUrl
          ) {
            URL.revokeObjectURL(
              slot.previewUrl
            );
          }
        }
      );
    };
  }, [photos]);

  /*
   * =====================================================
   * RESIZE PHOTO SLOTS WHEN QUANTITY CHANGES
   * =====================================================
   *
   * Existing selected photos are preserved.
   * New quantity slots are added empty.
   * Removed slots have their object URLs revoked.
   */

  const updateQuantity = (
    nextQuantity: number
  ) => {
    const safeQuantity =
      Math.max(
        1,
        Math.min(
          10,
          nextQuantity
        )
      );

    setError("");

    setPhotos(
      (currentPhotos) => {
        if (
          safeQuantity <
          currentPhotos.length
        ) {
          const removedPhotos =
            currentPhotos.slice(
              safeQuantity
            );

          removedPhotos.forEach(
            (slot) => {
              if (
                slot.previewUrl
              ) {
                URL.revokeObjectURL(
                  slot.previewUrl
                );
              }
            }
          );

          return currentPhotos.slice(
            0,
            safeQuantity
          );
        }

        if (
          safeQuantity >
          currentPhotos.length
        ) {
          return [
            ...currentPhotos,
            ...Array.from(
              {
                length:
                  safeQuantity -
                  currentPhotos.length,
              },
              () => ({
                file: null,
                previewUrl: "",
                uploaded: null,
              })
            ),
          ];
        }

        return currentPhotos;
      }
    );

    setQuantity(
      safeQuantity
    );
  };

  /*
   * =====================================================
   * HANDLE INDIVIDUAL PHOTO
   * =====================================================
   */

  const handlePhoto = (
    index: number,
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

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        `Photo ${index + 1}: Please upload a JPG, PNG, or WEBP image.`
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        `Photo ${index + 1}: Image must be 10 MB or smaller.`
      );

      event.target.value = "";
      return;
    }

    setPhotos(
      (currentPhotos) => {
        const nextPhotos =
          [...currentPhotos];

        const existing =
          nextPhotos[index];

        if (
          existing?.previewUrl
        ) {
          URL.revokeObjectURL(
            existing.previewUrl
          );
        }

        nextPhotos[index] = {
          file,
          previewUrl:
            URL.createObjectURL(
              file
            ),
          uploaded: null,
        };

        return nextPhotos;
      }
    );

    event.target.value = "";
  };

  /*
   * =====================================================
   * REMOVE INDIVIDUAL PHOTO
   * =====================================================
   */

  const removePhoto = (
    index: number
  ) => {
    setPhotos(
      (currentPhotos) => {
        const nextPhotos =
          [...currentPhotos];

        const existing =
          nextPhotos[index];

        if (
          existing?.previewUrl
        ) {
          URL.revokeObjectURL(
            existing.previewUrl
          );
        }

        nextPhotos[index] = {
          file: null,
          previewUrl: "",
          uploaded: null,
        };

        return nextPhotos;
      }
    );

    setError("");
  };

  /*
   * =====================================================
   * FILE → SMALL THUMBNAIL DATA URL
   * =====================================================
   *
   * Original files stay in private Supabase Storage.
   * Only a small compressed preview is stored locally,
   * preventing localStorage from being filled with
   * multiple large 10MB images.
   */

  const createThumbnailDataUrl = (
    file: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result !==
            "string"
          ) {
            reject(
              new Error(
                "Unable to read image."
              )
            );
            return;
          }

          const image =
            new Image();

          image.onload = () => {
            const maxDimension =
              700;

            const scale =
              Math.min(
                1,
                maxDimension /
                  Math.max(
                    image.width,
                    image.height
                  )
              );

            const width =
              Math.max(
                1,
                Math.round(
                  image.width *
                    scale
                )
              );

            const height =
              Math.max(
                1,
                Math.round(
                  image.height *
                    scale
                )
              );

            const canvas =
              document.createElement(
                "canvas"
              );

            canvas.width =
              width;

            canvas.height =
              height;

            const context =
              canvas.getContext(
                "2d"
              );

            if (!context) {
              reject(
                new Error(
                  "Unable to create image preview."
                )
              );
              return;
            }

            context.drawImage(
              image,
              0,
              0,
              width,
              height
            );

            const dataUrl =
              canvas.toDataURL(
                "image/jpeg",
                0.72
              );

            resolve(
              dataUrl
            );
          };

          image.onerror = () => {
            reject(
              new Error(
                "Unable to create image preview."
              )
            );
          };

          image.src =
            reader.result;
        };

        reader.onerror = () => {
          reject(
            new Error(
              "Unable to read image."
            )
          );
        };

        reader.readAsDataURL(
          file
        );
      }
    );
  };

  /*
   * =====================================================
   * UPLOAD ONE PHOTO TO SUPABASE
   * =====================================================
   */

  const uploadPhotoToSupabase =
    async (
      file: File
    ): Promise<UploadedPhotoInfo> => {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/upload-photo",
          {
            method: "POST",
            body: formData,
          }
        );

      let result:
        | {
            success?: boolean;
            storagePath?: string;
            originalName?: string;
            mimeType?: string;
            fileSize?: number;
            error?: string;
          }
        | null = null;

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "The photo upload service returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !result?.success ||
        !result.storagePath
      ) {
        throw new Error(
          result?.error ||
            "Unable to upload your photo."
        );
      }

      return {
        storagePath:
          result.storagePath,

        originalName:
          result.originalName ||
          file.name,

        mimeType:
          result.mimeType ||
          file.type,

        fileSize:
          result.fileSize ||
          file.size,
      };
    };

  /*
   * =====================================================
   * CONTINUE TO CUSTOMER DETAILS
   * =====================================================
   */

  const continueToCustomerDetails =
    async () => {
      if (isContinuing) {
        return;
      }

      setError("");

      /*
       * Quantity must exactly match the number
       * of selected photos.
       */

      if (
        photos.length !==
        quantity
      ) {
        setError(
          `Please select exactly ${quantity} photo${
            quantity === 1
              ? ""
              : "s"
          }.`
        );

        return;
      }

      const missingIndex =
        photos.findIndex(
          (slot) =>
            !slot.file
        );

      if (
        missingIndex !==
        -1
      ) {
        setError(
          `Please upload photo ${
            missingIndex + 1
          } of ${quantity} before continuing.`
        );

        return;
      }

      setIsContinuing(
        true
      );

      try {
        /*
         * ===================================================
         * UPLOAD ALL PHOTOS
         * ===================================================
         *
         * Already-uploaded slots are reused.
         * This prevents duplicate uploads if the user
         * retries after one upload has already succeeded.
         */

        const uploadedPhotos: PersistedPhoto[] =
          [];

        for (
          let index = 0;
          index <
          photos.length;
          index++
        ) {
          const slot =
            photos[index];

          if (!slot.file) {
            throw new Error(
              `Photo ${
                index + 1
              } is missing.`
            );
          }

          let uploaded =
            slot.uploaded;

          if (!uploaded) {
            uploaded =
              await uploadPhotoToSupabase(
                slot.file
              );

            setPhotos(
              (
                currentPhotos
              ) => {
                const nextPhotos =
                  [
                    ...currentPhotos,
                  ];

                if (
                  nextPhotos[index]
                ) {
                  nextPhotos[
                    index
                  ] = {
                    ...nextPhotos[
                      index
                    ],
                    uploaded,
                  };
                }

                return nextPhotos;
              }
            );
          }

          const preview =
            await createThumbnailDataUrl(
              slot.file
            );

          uploadedPhotos.push(
            {
              storagePath:
                uploaded.storagePath,

              originalName:
                uploaded.originalName,

              mimeType:
                uploaded.mimeType,

              fileSize:
                uploaded.fileSize,

              preview,
            }
          );
        }

        /*
         * ===================================================
         * VERIFY ALL UPLOADS
         * ===================================================
         */

        if (
          uploadedPhotos.length !==
          quantity
        ) {
          throw new Error(
            `Expected ${quantity} uploaded photos but received ${uploadedPhotos.length}.`
          );
        }

        const invalidUpload =
          uploadedPhotos.find(
            (photo) =>
              !photo.storagePath ||
              !photo.storagePath
                .startsWith(
                  "orders/"
                )
          );

        if (invalidUpload) {
          throw new Error(
            "One or more photos were not saved correctly. Please try again."
          );
        }

        /*
         * ===================================================
         * ORDER DATA
         * ===================================================
         */

        const firstPhoto =
          uploadedPhotos[0];

        const orderData = {
          sizeId,
          sizeName:
            size.name,
          dimensions:
            size.dimensions,

          frameId,
          frameName:
            frame.name,

          lithophaneId,
          lithophaneName:
            lithophane.name,

          lithophaneDescription:
            lithophane.description,

          quantity,

          unitPrice:
            size.price,

          subtotal,
          discount,
          total,

          /*
           * New multi-photo structure.
           */
          photos:
            uploadedPhotos,

          /*
           * Legacy first-photo fields remain
           * for compatibility with older pages.
           */
          photoName:
            firstPhoto.originalName,

          photoType:
            firstPhoto.mimeType,

          photoSize:
            firstPhoto.fileSize,

          photoStoragePath:
            firstPhoto.storagePath,

          photoStorageName:
            firstPhoto.originalName,

          photoStorageMimeType:
            firstPhoto.mimeType,

          photoStorageSize:
            firstPhoto.fileSize,

          createdAt:
            new Date().toISOString(),
        };

        /*
         * ===================================================
         * SAVE MULTI-PHOTO CHECKOUT CONFIG
         * ===================================================
         */

        localStorage.setItem(
          "rmx_checkout_config",
          JSON.stringify(
            orderData
          )
        );

        sessionStorage.setItem(
          "rmx_checkout_config",
          JSON.stringify(
            orderData
          )
        );

        sessionStorage.setItem(
          "rmx_checkout_order",
          JSON.stringify(
            orderData
          )
        );

        /*
         * ===================================================
         * SAVE MULTI-PHOTO STORAGE
         * ===================================================
         */

        localStorage.setItem(
          "rmx_checkout_photos",
          JSON.stringify(
            uploadedPhotos
          )
        );

        /*
         * ===================================================
         * SAVE ORDER DETAILS
         * ===================================================
         */

        localStorage.setItem(
          "rmx_order_details",
          JSON.stringify({
            size:
              sizeId,

            sizeId,

            sizeName:
              size.name,

            dimensions:
              size.dimensions,

            frame:
              frameId,

            frameId,

            frameName:
              frame.name,

            lithophane:
              lithophaneId,

            lithophaneId,

            lithophaneName:
              lithophane.name,

            quantity,

            price:
              size.price,

            unitPrice:
              size.price,

            subtotal,
            discount,
            total,

            /*
             * Multi-photo paths.
             */
            photos:
              uploadedPhotos.map(
                (
                  photo
                ) => ({
                  storagePath:
                    photo.storagePath,

                  originalName:
                    photo.originalName,

                  mimeType:
                    photo.mimeType,

                  fileSize:
                    photo.fileSize,
                })
              ),

            /*
             * Legacy first-photo path.
             */
            photoStoragePath:
              firstPhoto.storagePath,
          })
        );

        /*
         * ===================================================
         * LEGACY FIRST-PHOTO STORAGE
         * ===================================================
         *
         * Keep these keys so the existing customer-details,
         * payment and success pages continue to understand
         * the first uploaded photo.
         */

        localStorage.setItem(
          "rmx_checkout_photo",
          firstPhoto.preview
        );

        localStorage.setItem(
          "rmx_lithophane_photo",
          firstPhoto.preview
        );

        localStorage.setItem(
          "lithophanePhoto",
          firstPhoto.preview
        );

        localStorage.setItem(
          "uploadedPhoto",
          firstPhoto.preview
        );

        localStorage.setItem(
          "rmx_photo_storage_path",
          firstPhoto.storagePath
        );

        localStorage.setItem(
          "rmx_photo_storage_name",
          firstPhoto.originalName
        );

        localStorage.setItem(
          "rmx_photo_storage_mime_type",
          firstPhoto.mimeType
        );

        localStorage.setItem(
          "rmx_photo_storage_size",
          String(
            firstPhoto.fileSize
          )
        );

        /*
         * ===================================================
         * CONTINUE
         * ===================================================
         */

        window.location.href =
          "/checkout/customer-details";
      } catch (uploadError) {
        console.error(
          "Unable to save checkout photos:",
          uploadError
        );

        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to save your photos. Please try again."
        );

        setIsContinuing(
          false
        );
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
            Upload your photo
            {quantity > 1
              ? "s"
              : ""}
            , confirm your
            configuration, and continue
            with your order details.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">

            <div className="mb-6">

              <h2 className="text-xl font-bold">
                1. Upload your photo
                {quantity > 1
                  ? "s"
                  : ""}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Quantity {quantity} requires{" "}
                {quantity} photo
                {quantity === 1
                  ? ""
                  : "s"}
                . JPG, PNG, or WEBP up to
                10 MB each.
              </p>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-3">

                <span className="text-sm text-gray-400">
                  Photos selected
                </span>

                <span className="font-black text-cyan-400">
                  {uploadedCount} /{" "}
                  {quantity}
                </span>

              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {photos.map(
                (
                  slot,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="overflow-hidden rounded-3xl border border-white/10 bg-black"
                  >

                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

                      <div>
                        <p className="text-sm font-bold">
                          Photo{" "}
                          {index + 1}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-600">
                          Required
                        </p>
                      </div>

                      {slot.file && (
                        <Check
                          size={18}
                          className="text-emerald-400"
                        />
                      )}

                    </div>

                    {!slot.previewUrl ? (

                      <label className="group flex min-h-[250px] cursor-pointer flex-col items-center justify-center px-5 text-center transition hover:bg-cyan-400/[0.03]">

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(
                            event
                          ) =>
                            handlePhoto(
                              index,
                              event
                            )
                          }
                          className="hidden"
                        />

                        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                          <Upload
                            className="text-cyan-400"
                            size={26}
                          />

                        </div>

                        <p className="font-bold">
                          Upload photo{" "}
                          {index + 1}
                        </p>

                        <p className="mt-2 text-xs text-gray-600">
                          JPG, PNG or WEBP
                        </p>

                        <span className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-black text-black transition group-hover:bg-cyan-300">
                          SELECT PHOTO
                        </span>

                      </label>

                    ) : (

                      <div>

                        <div className="relative aspect-square">

                          <img
                            src={
                              slot.previewUrl
                            }
                            alt={`Uploaded photo ${index + 1}`}
                            className="h-full w-full object-contain"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removePhoto(
                                index
                              )
                            }
                            className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/80 p-2 text-white backdrop-blur transition hover:bg-white hover:text-black"
                            aria-label={`Remove photo ${index + 1}`}
                          >
                            <X
                              size={
                                16
                              }
                            />
                          </button>

                        </div>

                        <div className="border-t border-white/10 px-4 py-3">

                          <p className="truncate text-xs font-bold">
                            {
                              slot
                                .file
                                ?.name
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-gray-600">
                            {slot
                              .uploaded
                              ? "Securely uploaded"
                              : "Ready to upload"}
                          </p>

                        </div>

                      </div>

                    )}

                  </div>
                )
              )}

            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
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
                    photos[0]
                      ?.previewUrl ||
                    heroImage
                  }
                  alt={
                    photos[0]
                      ?.previewUrl
                      ? "Your uploaded photo"
                      : "Selected lithophane configuration"
                  }
                  className="h-full w-full object-contain"
                />

              </div>

            </div>

            <p className="mt-3 text-center text-xs text-gray-600">
              {photos[0]
                ?.previewUrl
                ? "First uploaded photo"
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
                    updateQuantity(
                      quantity -
                        1
                    )
                  }
                  disabled={
                    quantity <=
                    1
                  }
                  className="px-3 text-lg text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                    updateQuantity(
                      quantity +
                        1
                    )
                  }
                  disabled={
                    quantity >=
                    10
                  }
                  className="px-3 text-lg text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">

              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  Required photos
                </span>

                <span className="font-bold text-white">
                  {quantity}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-sm text-gray-400">
                <span>
                  Uploaded
                </span>

                <span
                  className={
                    uploadedCount ===
                    quantity
                      ? "font-bold text-emerald-400"
                      : "font-bold text-cyan-400"
                  }
                >
                  {uploadedCount}
                </span>
              </div>

            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">

              <div className="flex justify-between text-gray-400">
                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>
                    10% discount
                  </span>

                  <span>
                    -₹
                    {discount.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 text-xl font-black">
                <span>
                  Total
                </span>

                <span>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
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
                  !allPhotosReady ||
                  isContinuing
                }
                className="w-full rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-600"
              >
                {isContinuing
                  ? `UPLOADING ${quantity} PHOTO${
                      quantity === 1
                        ? ""
                        : "S"
                    }...`
                  : "CONTINUE TO CUSTOMER DETAILS"}
              </button>

              {!allPhotosReady && (
                <p className="mt-3 text-center text-xs text-gray-600">
                  Upload all{" "}
                  {quantity} photo
                  {quantity === 1
                    ? ""
                    : "s"}{" "}
                  to continue.
                </p>
              )}

              {allPhotosReady &&
                !isContinuing && (
                  <p className="mt-3 text-center text-xs text-gray-500">
                    All {quantity} photo
                    {quantity === 1
                      ? ""
                      : "s"}{" "}
                    ready. Continue to enter
                    your delivery details.
                  </p>
                )}

            </div>

          </aside>

        </div>

      </div>
    </main>
  );
}