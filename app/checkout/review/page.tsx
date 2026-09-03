"use client";

import { useEffect, useState } from "react";

type CustomerDetails = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type OrderDetails = {
  size: string;
  frame: string;
  lithophane: string;
  quantity: number;
  price: number;
  subtotal: number;
  discount: number;
  total: number;
};

type PhotoDetails = {
  storagePath: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  preview?: string;
};

type CreateOrderResponse = {
  success?: boolean;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  photoId?: string;
  photoStoragePath?: string;
  error?: string;
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

function calculateOrder(
  sizeValue: string | undefined,
  frameValue: string | undefined,
  lithophaneValue: string | undefined,
  quantityValue: number
): OrderDetails {
  const size = normalizeSize(sizeValue);
  const frame = normalizeFrame(frameValue);
  const lithophane = normalizeLithophane(lithophaneValue);

  const quantity = Math.max(
    1,
    Math.min(
      10,
      Number(quantityValue) || 1
    )
  );

  const price = SIZE_PRICES[size];

  const subtotal = price * quantity;

  const discount =
    quantity >= 2
      ? Math.round(subtotal * 0.1)
      : 0;

  const total = subtotal - discount;

  return {
    size,
    frame,
    lithophane,
    quantity,
    price,
    subtotal,
    discount,
    total,
  };
}

function formatLabel(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

export default function ReviewPage() {
  const [customer, setCustomer] =
    useState<CustomerDetails>({
      fullName: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "Maharashtra",
      pincode: "",
    });

  const [order, setOrder] =
    useState<OrderDetails>(
      calculateOrder(
        "standard",
        "black",
        "natural-white",
        1
      )
    );

  const [photos, setPhotos] =
    useState<PhotoDetails[]>([]);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    try {
      /*
       * =====================================================
       * CUSTOMER DETAILS
       * =====================================================
       */

      const savedCustomer =
        localStorage.getItem(
          "rmx_customer_details"
        ) ||
        localStorage.getItem(
          "customerDetails"
        );

      if (savedCustomer) {
        const parsed =
          JSON.parse(savedCustomer);

        setCustomer({
          fullName:
            parsed.fullName ||
            parsed.name ||
            "",

          mobile:
            parsed.mobile ||
            parsed.phone ||
            "",

          email:
            parsed.email ||
            "",

          address:
            parsed.address ||
            parsed.completeAddress ||
            "",

          city:
            parsed.city ||
            "",

          state:
            parsed.state ||
            "Maharashtra",

          pincode:
            parsed.pincode ||
            parsed.pinCode ||
            parsed.zip ||
            "",
        });
      }

      /*
       * =====================================================
       * CURRENT CHECKOUT CONFIGURATION
       * =====================================================
       *
       * This remains the highest-priority source so an old
       * checkout/order value cannot overwrite the current
       * product selection.
       */

      let currentOrder:
        | OrderDetails
        | null = null;

      const savedConfig =
        localStorage.getItem(
          "rmx_checkout_config"
        );

      if (savedConfig) {
        try {
          const parsed =
            JSON.parse(savedConfig);

          currentOrder =
            calculateOrder(
              parsed.sizeId ||
                parsed.size,

              parsed.frameId ||
                parsed.frame,

              parsed.lithophaneId ||
                parsed.lithophane,

              Number(
                parsed.quantity
              ) || 1
            );
        } catch (configError) {
          console.error(
            "Invalid rmx_checkout_config:",
            configError
          );
        }
      }

      /*
       * =====================================================
       * SESSION FALLBACK
       * =====================================================
       */

      if (!currentOrder) {
        const savedSessionOrder =
          sessionStorage.getItem(
            "rmx_checkout_order"
          );

        if (savedSessionOrder) {
          try {
            const parsed =
              JSON.parse(
                savedSessionOrder
              );

            currentOrder =
              calculateOrder(
                parsed.sizeId ||
                  parsed.size,

                parsed.frameId ||
                  parsed.frame,

                parsed.lithophaneId ||
                  parsed.lithophane,

                Number(
                  parsed.quantity
                ) || 1
              );
          } catch (sessionError) {
            console.error(
              "Invalid session checkout order:",
              sessionError
            );
          }
        }
      }

      /*
       * =====================================================
       * FINAL ORDER FALLBACK
       * =====================================================
       */

      if (!currentOrder) {
        const savedFinalOrder =
          localStorage.getItem(
            "rmx_final_order"
          );

        if (savedFinalOrder) {
          try {
            const parsed =
              JSON.parse(
                savedFinalOrder
              );

            const source =
              parsed.order ||
              parsed;

            currentOrder =
              calculateOrder(
                source.sizeId ||
                  source.size,

                source.frameId ||
                  source.frame,

                source.lithophaneId ||
                  source.lithophane,

                Number(
                  source.quantity
                ) || 1
              );
          } catch (finalOrderError) {
            console.error(
              "Invalid final order:",
              finalOrderError
            );
          }
        }
      }

      /*
       * =====================================================
       * OLD STORAGE FALLBACK
       * =====================================================
       */

      if (!currentOrder) {
        const savedOrder =
          localStorage.getItem(
            "rmx_order_details"
          ) ||
          localStorage.getItem(
            "orderDetails"
          );

        if (savedOrder) {
          try {
            const parsed =
              JSON.parse(savedOrder);

            currentOrder =
              calculateOrder(
                parsed.sizeId ||
                  parsed.size,

                parsed.frameId ||
                  parsed.frame,

                parsed.lithophaneId ||
                  parsed.lithophane,

                Number(
                  parsed.quantity
                ) || 1
              );
          } catch (oldOrderError) {
            console.error(
              "Invalid old order storage:",
              oldOrderError
            );
          }
        }
      }

      /*
       * =====================================================
       * URL FALLBACK
       * =====================================================
       */

      if (!currentOrder) {
        const params =
          new URLSearchParams(
            window.location.search
          );

        currentOrder =
          calculateOrder(
            params.get("size") ||
              "standard",

            params.get("frame") ||
              "black",

            params.get("lithophane") ||
              "natural-white",

            Number(
              params.get("quantity") ||
                "1"
            )
          );
      }

      /*
       * =====================================================
       * FINAL SERVER-MATCHED PRICING
       * =====================================================
       */

      const finalOrder =
        calculateOrder(
          currentOrder.size,
          currentOrder.frame,
          currentOrder.lithophane,
          currentOrder.quantity
        );

      setOrder(finalOrder);

      /*
       * Keep the normalized checkout order available.
       */

      sessionStorage.setItem(
        "rmx_checkout_order",
        JSON.stringify(
          finalOrder
        )
      );

      localStorage.setItem(
        "rmx_order_details",
        JSON.stringify(
          finalOrder
        )
      );

      localStorage.setItem(
        "orderDetails",
        JSON.stringify(
          finalOrder
        )
      );

      /*
       * =====================================================
       * MULTI-PHOTO STORAGE
       * =====================================================
       *
       * New format:
       *
       * rmx_checkout_photos = [
       *   {
       *     storagePath,
       *     originalName,
       *     mimeType,
       *     fileSize,
       *     preview
       *   }
       * ]
       *
       * Legacy single-photo storage remains supported.
       */

      let loadedPhotos:
        PhotoDetails[] = [];

      const savedPhotos =
        localStorage.getItem(
          "rmx_checkout_photos"
        );

      if (savedPhotos) {
        try {
          const parsed =
            JSON.parse(
              savedPhotos
            );

          if (
            Array.isArray(parsed)
          ) {
            loadedPhotos =
              parsed
                .filter(
                  (item) =>
                    item &&
                    typeof item.storagePath ===
                      "string" &&
                    item.storagePath.trim()
                )
                .map(
                  (item) => ({
                    storagePath:
                      String(
                        item.storagePath
                      ),

                    originalName:
                      String(
                        item.originalName ||
                          ""
                      ),

                    mimeType:
                      String(
                        item.mimeType ||
                          ""
                      ),

                    fileSize:
                      Number(
                        item.fileSize ||
                          0
                      ),

                    preview:
                      typeof item.preview ===
                        "string"
                        ? item.preview
                        : undefined,
                  })
                );
          }
        } catch (photoError) {
          console.error(
            "Invalid rmx_checkout_photos:",
            photoError
          );
        }
      }

      /*
       * Legacy single-photo fallback.
       */

      if (
        loadedPhotos.length === 0
      ) {
        const legacyStoragePath =
          localStorage.getItem(
            "rmx_photo_storage_path"
          ) ||
          "";

        const legacyPhoto =
          localStorage.getItem(
            "rmx_checkout_photo"
          ) ||
          localStorage.getItem(
            "rmx_lithophane_photo"
          ) ||
          localStorage.getItem(
            "lithophanePhoto"
          ) ||
            localStorage.getItem(
              "uploadedPhoto"
            ) ||
            "";

        if (
          legacyStoragePath
        ) {
          loadedPhotos = [
            {
              storagePath:
                legacyStoragePath,

              originalName:
                localStorage.getItem(
                  "rmx_photo_storage_name"
                ) ||
                "",

              mimeType:
                localStorage.getItem(
                  "rmx_photo_storage_mime_type"
                ) ||
                "",

              fileSize:
                Number(
                  localStorage.getItem(
                    "rmx_photo_storage_size"
                  ) ||
                    0
                ),

              preview:
                legacyPhoto ||
                undefined,
            },
          ];
        }
      }

      setPhotos(
        loadedPhotos
      );
    } catch (loadError) {
      console.error(
        "Unable to load checkout information:",
        loadError
      );

      setError(
        "Unable to load your checkout information. Please go back and try again."
      );
    }
  }, []);

  const quantity =
    Math.max(
      1,
      Math.min(
        10,
        order.quantity
      )
    );

  const normalizedSize =
    normalizeSize(
      order.size
    );

  const unitPrice =
    SIZE_PRICES[
      normalizedSize
    ];

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

  const handleBack = () => {
    window.location.href =
      "/checkout";
  };

  const handlePlaceOrder =
    async () => {
      if (placingOrder) {
        return;
      }

      setError("");
      setPlacingOrder(true);

      try {
        /*
         * =====================================================
         * PHOTO COUNT VALIDATION
         * =====================================================
         */

        if (
          photos.length !==
          quantity
        ) {
          throw new Error(
            `Please upload exactly ${quantity} photo${
              quantity === 1
                ? ""
                : "s"
            } for this order.`
          );
        }

        /*
         * Every photo must have a valid private Storage path.
         */

        const invalidPhoto =
          photos.find(
            (photo) =>
              !photo.storagePath ||
              !photo.storagePath
                .trim()
                .startsWith(
                  "orders/"
                )
          );

        if (invalidPhoto) {
          throw new Error(
            "One or more uploaded photos could not be found. Please go back and upload the photos again."
          );
        }

        /*
         * =====================================================
         * CUSTOMER VALIDATION
         * =====================================================
         */

        if (
          !customer.fullName
        ) {
          throw new Error(
            "Customer name is missing. Please go back and enter your details."
          );
        }

        if (
          !customer.mobile
        ) {
          throw new Error(
            "Mobile number is missing. Please go back and enter your details."
          );
        }

        if (
          !customer.address
        ) {
          throw new Error(
            "Delivery address is missing. Please go back and enter your details."
          );
        }

        if (
          !customer.city
        ) {
          throw new Error(
            "City is missing. Please go back and enter your details."
          );
        }

        if (
          !customer.pincode
        ) {
          throw new Error(
            "PIN code is missing. Please go back and enter your details."
          );
        }

        /*
         * =====================================================
         * CREATE DATABASE ORDER
         * =====================================================
         */

        const response =
          await fetch(
            "/api/orders/create",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  customer: {
                    fullName:
                      customer.fullName,

                    mobile:
                      customer.mobile,

                    email:
                      customer.email,

                    address:
                      customer.address,

                    city:
                      customer.city,

                    state:
                      customer.state,

                    pincode:
                      customer.pincode,
                  },

                  order: {
                    size:
                      normalizedSize,

                    frame:
                      normalizeFrame(
                        order.frame
                      ),

                    lithophane:
                      normalizeLithophane(
                        order.lithophane
                      ),

                    quantity,
                  },

                  photos:
                    photos.map(
                      (photo) => ({
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
                }),
            }
          );

        let result:
          | CreateOrderResponse
          | null = null;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "The order service returned an invalid response."
          );
        }

        if (
          !response.ok ||
          !result?.success ||
          !result.orderId ||
          !result.orderNumber
        ) {
          throw new Error(
            result?.error ||
              "Unable to create your order. Please try again."
          );
        }

        /*
         * =====================================================
         * FINAL ORDER
         * =====================================================
         */

        const finalOrder = {
          orderId:
            result.orderNumber,

          databaseOrderId:
            result.orderId,

          status:
            "payment_pending",

          paymentStatus:
            result.paymentStatus ||
            "pending",

          customer,

          order: {
            size:
              normalizedSize,

            frame:
              normalizeFrame(
                order.frame
              ),

            lithophane:
              normalizeLithophane(
                order.lithophane
              ),

            quantity,

            price:
              unitPrice,

            subtotal,

            discount,

            total,
          },

          photos,

          /*
           * Keep the first photo under the legacy `photo`
           * field so the current payment/success flow remains
           * compatible while multi-photo support is added.
           */

          photo:
            photos[0] || null,

          createdAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          "rmx_final_order",
          JSON.stringify(
            finalOrder
          )
        );

        localStorage.setItem(
          "rmx_order_id",
          result.orderNumber
        );

        localStorage.setItem(
          "rmx_database_order_id",
          result.orderId
        );

        /*
         * Keep first-photo legacy storage compatible.
         */

        if (
          photos[0]
        ) {
          localStorage.setItem(
            "rmx_photo_storage_path",
            photos[0]
              .storagePath
          );

          localStorage.setItem(
            "rmx_checkout_photo",
            photos[0]
              .preview || ""
          );
        }

        /*
         * Preserve normalized order storage.
         */

        const normalizedOrder = {
          size:
            normalizedSize,

          frame:
            normalizeFrame(
              order.frame
            ),

          lithophane:
            normalizeLithophane(
              order.lithophane
            ),

          quantity,

          price:
            unitPrice,

          subtotal,

          discount,

          total,
        };

        sessionStorage.setItem(
          "rmx_checkout_order",
          JSON.stringify(
            normalizedOrder
          )
        );

        localStorage.setItem(
          "rmx_order_details",
          JSON.stringify(
            normalizedOrder
          )
        );

        localStorage.setItem(
          "orderDetails",
          JSON.stringify(
            normalizedOrder
          )
        );

        /*
         * =====================================================
         * CONTINUE TO PAYMENT
         * =====================================================
         */

        window.location.href =
          "/checkout/payment";
      } catch (orderError) {
        console.error(
          "RMX order creation error:",
          orderError
        );

        setError(
          orderError instanceof Error
            ? orderError.message
            : "Unable to continue to payment. Please try again."
        );

        setPlacingOrder(false);
      }
    };

  return (
    <main
      style={{
        minHeight:
          "100vh",

        background:
          "#000",

        color:
          "#fff",

        padding:
          "32px 20px 70px",

        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width:
            "100%",

          maxWidth:
            "1100px",

          margin:
            "0 auto",
        }}
      >
        <button
          type="button"
          onClick={
            handleBack
          }
          style={{
            background:
              "transparent",

            border:
              "none",

            color:
              "#8b8b8b",

            fontSize:
              "12px",

            padding:
              0,

            marginBottom:
              "18px",

            cursor:
              "pointer",
          }}
        >
          ← Back to checkout
        </button>

        <div
          style={{
            display:
              "inline-flex",

            alignItems:
              "center",

            gap:
              "7px",

            border:
              "1px solid rgba(34,211,238,.35)",

            background:
              "rgba(34,211,238,.08)",

            color:
              "#22d3ee",

            borderRadius:
              "999px",

            padding:
              "6px 11px",

            fontSize:
              "10px",

            fontWeight:
              700,

            letterSpacing:
              "1px",

            marginBottom:
              "12px",
          }}
        >
          ✓ ORDER REVIEW
        </div>

        <h1
          style={{
            fontSize:
              "clamp(32px, 5vw, 54px)",

            lineHeight:
              1,

            margin:
              "0 0 10px",

            fontWeight:
              800,

            letterSpacing:
              "-1.5px",
          }}
        >
          Review Your Order
        </h1>

        <p
          style={{
            color:
              "#8b8b8b",

            fontSize:
              "13px",

            margin:
              "0 0 30px",
          }}
        >
          Please check your personalized lamp,
          delivery details, photos, and order
          total before continuing to payment.
        </p>

        {error && (
          <div
            style={{
              marginBottom:
                "20px",

              padding:
                "12px 14px",

              border:
                "1px solid rgba(248,113,113,.3)",

              background:
                "rgba(248,113,113,.07)",

              color:
                "#fca5a5",

              borderRadius:
                "10px",

              fontSize:
                "12px",

              lineHeight:
                1.5,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "minmax(0, 1.4fr) minmax(280px, .8fr)",

            gap:
              "20px",
          }}
        >
          <section
            style={{
              background:
                "#080808",

              border:
                "1px solid #242424",

              borderRadius:
                "16px",

              padding:
                "20px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "17px",

                margin:
                  "0 0 18px",
              }}
            >
              Your personalized lamp
            </h2>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "minmax(180px, 260px) 1fr",

                gap:
                  "22px",
              }}
            >
              <div>
                <div
                  style={{
                    border:
                      "1px solid #242424",

                    borderRadius:
                      "12px",

                    background:
                      "#000",

                    padding:
                      "10px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        photos.length > 1
                          ? "1fr 1fr"
                          : "1fr",

                      gap:
                        "8px",
                    }}
                  >
                    {photos.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            `${item.storagePath}-${index}`
                          }
                          style={{
                            aspectRatio:
                              "1",

                            overflow:
                              "hidden",

                            border:
                              "1px solid #202020",

                            borderRadius:
                              "8px",

                            background:
                              "#050505",
                          }}
                        >
                          {item.preview ? (
                            <img
                              src={
                                item.preview
                              }
                              alt={`Uploaded photo ${index + 1}`}
                              style={{
                                width:
                                  "100%",

                                height:
                                  "100%",

                                objectFit:
                                  "contain",

                                display:
                                  "block",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height:
                                  "100%",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                color:
                                  "#555",

                                fontSize:
                                  "10px",

                                textAlign:
                                  "center",

                                padding:
                                  "8px",
                              }}
                            >
                              Photo {index + 1}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    {photos.length === 0 && (
                      <div
                        style={{
                          minHeight:
                            "260px",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          color:
                            "#555",

                          fontSize:
                            "12px",

                          textAlign:
                            "center",

                          padding:
                            "20px",
                        }}
                      >
                        Photo preview unavailable
                      </div>
                    )}
                  </div>
                </div>

                <p
                  style={{
                    color:
                      "#555",

                    fontSize:
                      "10px",

                    textAlign:
                      "center",

                    margin:
                      "8px 0 0",
                  }}
                >
                  {photos.length} photo
                  {photos.length === 1
                    ? ""
                    : "s"} uploaded
                </p>
              </div>

              <div>
                <div
                  style={{
                    border:
                      "1px solid rgba(34,211,238,.25)",

                    background:
                      "rgba(34,211,238,.05)",

                    borderRadius:
                      "12px",

                    padding:
                      "15px",

                    marginBottom:
                      "14px",
                  }}
                >
                  <div
                    style={{
                      color:
                        "#22d3ee",

                      fontSize:
                        "9px",

                      fontWeight:
                        700,

                      letterSpacing:
                        "1px",

                      marginBottom:
                        "8px",
                    }}
                  >
                    YOUR SELECTION
                  </div>

                  <div
                    style={{
                      fontSize:
                        "14px",

                      fontWeight:
                        700,
                    }}
                  >
                    {formatLabel(
                      normalizedSize
                    )}{" "}
                    ·{" "}
                    {formatLabel(
                      order.lithophane
                    )}{" "}
                    ·{" "}
                    {formatLabel(
                      order.frame
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "1fr 1fr",

                    gap:
                      "10px",
                  }}
                >
                  <InfoBox
                    label="QUANTITY"
                    value={String(
                      quantity
                    )}
                  />

                  <InfoBox
                    label="UNIT PRICE"
                    value={`₹${unitPrice.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <InfoBox
                    label="CUSTOMER"
                    value={
                      customer.fullName ||
                      "Not provided"
                    }
                  />

                  <InfoBox
                    label="MOBILE"
                    value={
                      customer.mobile ||
                      "Not provided"
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "10px",

                    display:
                      "grid",

                    gridTemplateColumns:
                      "1fr",

                    gap:
                      "10px",
                  }}
                >
                  <InfoBox
                    label="DELIVERY ADDRESS"
                    value={[
                      customer.address,
                      customer.city,
                      customer.state,
                      customer.pincode,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        ", "
                      ) ||
                      "Not provided"}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "20px",

                borderTop:
                  "1px solid #202020",

                paddingTop:
                  "18px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  gap:
                    "15px",

                  color:
                    "#999",

                  fontSize:
                    "12px",

                  marginBottom:
                    "9px",
                }}
              >
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
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    gap:
                      "15px",

                    color:
                      "#34d399",

                    fontSize:
                      "12px",

                    marginBottom:
                      "9px",
                  }}
                >
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

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  gap:
                    "15px",

                  color:
                    "#fff",

                  fontSize:
                    "20px",

                  fontWeight:
                    800,
                }}
              >
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

              {quantity >= 2 && (
                <p
                  style={{
                    color:
                      "#34d399",

                    fontSize:
                      "10px",

                    margin:
                      "8px 0 0",
                  }}
                >
                  10% multi-piece discount
                  applied.
                </p>
              )}
            </div>
          </section>

          <aside
            style={{
              height:
                "fit-content",

              background:
                "#080808",

              border:
                "1px solid #242424",

              borderRadius:
                "16px",

              padding:
                "20px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "17px",

                margin:
                  "0 0 18px",
              }}
            >
              Order confirmation
            </h2>

            <div
              style={{
                border:
                  "1px solid rgba(34,211,238,.18)",

                background:
                  "rgba(34,211,238,.04)",

                borderRadius:
                  "12px",

                padding:
                  "15px",
              }}
            >
              <div
                style={{
                  color:
                    "#555",

                  fontSize:
                    "9px",

                  fontWeight:
                    700,

                  letterSpacing:
                    "1px",

                  marginBottom:
                    "8px",
                }}
              >
                ORDER SUMMARY
              </div>

              <div
                style={{
                  fontSize:
                    "13px",

                  lineHeight:
                    1.6,

                  color:
                    "#ddd",
                }}
              >
                {quantity} personalized
                lamp
                {quantity === 1
                  ? ""
                  : "s"}
              </div>

              <div
                style={{
                  marginTop:
                    "6px",

                  color:
                    "#888",

                  fontSize:
                    "11px",
                }}
              >
                {formatLabel(
                  normalizedSize
                )}{" "}
                ·{" "}
                {formatLabel(
                  order.frame
                )}{" "}
                ·{" "}
                {formatLabel(
                  order.lithophane
                )}
              </div>

              <div
                style={{
                  marginTop:
                    "12px",

                  paddingTop:
                    "12px",

                  borderTop:
                    "1px solid #202020",

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",
                }}
              >
                <span
                  style={{
                    color:
                      "#888",

                    fontSize:
                      "11px",
                  }}
                >
                  Amount
                </span>

                <strong
                  style={{
                    fontSize:
                      "20px",
                  }}
                >
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                placingOrder ||
                photos.length !==
                  quantity
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "20px",

                border:
                  "none",

                borderRadius:
                  "10px",

                background:
                  placingOrder ||
                  photos.length !==
                    quantity
                    ? "#555"
                    : "#fff",

                color:
                  placingOrder ||
                  photos.length !==
                    quantity
                    ? "#aaa"
                    : "#000",

                padding:
                  "14px 18px",

                fontWeight:
                  800,

                fontSize:
                  "12px",

                cursor:
                  placingOrder ||
                  photos.length !==
                    quantity
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {placingOrder
                ? "CREATING ORDER..."
                : "CONTINUE TO PAYMENT"}
            </button>

            {photos.length !==
              quantity && (
              <p
                style={{
                  color:
                    "#777",

                  fontSize:
                    "10px",

                  lineHeight:
                    1.5,

                  textAlign:
                    "center",

                  margin:
                    "10px 0 0",
                }}
              >
                {quantity -
                  photos.length >
                0
                  ? `Upload ${
                      quantity -
                      photos.length
                    } more photo${
                      quantity -
                        photos.length ===
                      1
                        ? ""
                        : "s"
                    } to continue.`
                  : "Photo count does not match the selected quantity."}
              </p>
            )}

            <p
              style={{
                color:
                  "#555",

                fontSize:
                  "10px",

                lineHeight:
                  1.5,

                textAlign:
                  "center",

                margin:
                  "12px 0 0",
              }}
            >
              Secure checkout · Made to
              order · Fast shipping
            </p>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          main {
            padding: 24px 14px 50px !important;
          }

          main > div > div {
            grid-template-columns: 1fr !important;
          }

          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border:
          "1px solid #202020",

        borderRadius:
          "10px",

        padding:
          "10px 12px",

        background:
          "#050505",
      }}
    >
      <div
        style={{
          color:
            "#555",

          fontSize:
            "8px",

          fontWeight:
            700,

          letterSpacing:
            "1px",

          marginBottom:
            "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#ddd",

          fontSize:
            "11px",

          lineHeight:
            1.4,

          wordBreak:
            "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}