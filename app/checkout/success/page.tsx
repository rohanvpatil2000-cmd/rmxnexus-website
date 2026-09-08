"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      parameters?: Record<string, unknown>,
      options?: Record<string, unknown>
    ) => void;
  }
}

type PaymentMethod =
  | "online"
  | "cod";

type OrderData = {
  orderId?: string;

  status?: string;

  paymentStatus?: string;

  paymentMethod?: PaymentMethod;

  customer?: {
    fullName?: string;
    mobile?: string;
    email?: string;
  };

  order?: {
    size?: string;
    frame?: string;
    lithophane?: string;
    quantity?: number;
    total?: number;
  };

  prepaidDiscount?: number;

  prepaidTotal?: number;

  razorpay?: {
    paymentId?: string;
    orderId?: string;
  };

  paidAt?: string;
};

export default function SuccessPage() {
  const [order, setOrder] =
    useState<OrderData | null>(
      null
    );

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "rmx_final_order"
        );

      if (saved) {
        const parsed =
          JSON.parse(
            saved
          ) as OrderData;

        /*
         * If the payment method wasn't embedded in the
         * final object by an older/current flow, recover it
         * from the dedicated localStorage key.
         */
        if (
          !parsed.paymentMethod
        ) {
          const storedMethod =
            localStorage.getItem(
              "rmx_payment_method"
            );

          if (
            storedMethod ===
              "online" ||
            storedMethod ===
              "cod"
          ) {
            parsed.paymentMethod =
              storedMethod;
          }
        }

        setOrder(
          parsed
        );
      }
    } catch (error) {
      console.error(
        "Unable to load completed order:",
        error
      );
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * META PURCHASE TRACKING
   * ---------------------------------------------------------
   *
   * Purchase is sent only after the customer reaches this
   * success page through the completed order flow.
   *
   * COD:
   *   Value = normal order total because payment is collected
   *   on delivery.
   *
   * ONLINE:
   *   Value = actual prepaid amount paid after the extra 5%
   *   prepaid discount.
   *
   * A localStorage key prevents the same order from generating
   * another Purchase event if the customer refreshes the page.
   */
  useEffect(() => {
    if (!order?.orderId) {
      return;
    }

    const paymentMethod =
      order.paymentMethod;

    const isCod =
      paymentMethod === "cod";

    const isOnline =
      paymentMethod === "online";

    /*
     * The success page should only represent a confirmed order.
     *
     * COD remains payment_status = pending because payment is
     * collected on delivery, but the COD confirmation endpoint
     * has already confirmed the order before this page is shown.
     *
     * Online orders must have payment_status = paid.
     */
    const orderConfirmed =
      isCod ||
      (
        isOnline &&
        order.paymentStatus ===
          "paid"
      );

    if (!orderConfirmed) {
      return;
    }

    /*
     * Determine the exact transaction value to send to Meta.
     */
    let purchaseValue: number;

    if (isCod) {
      purchaseValue =
        Number(
          order.order?.total
        );
    } else {
      purchaseValue =
        Number(
          order.prepaidTotal
        );
    }

    /*
     * Never send an invalid or guessed purchase amount.
     */
    if (
      !Number.isFinite(
        purchaseValue
      ) ||
      purchaseValue <= 0
    ) {
      console.error(
        "Meta Purchase tracking skipped: invalid purchase value.",
        {
          orderId:
            order.orderId,
          paymentMethod,
          purchaseValue,
        }
      );

      return;
    }

    const trackingKey =
      `rmx_meta_purchase_tracked_${order.orderId}`;

    /*
     * Prevent duplicate Purchase events on refresh.
     */
    if (
      localStorage.getItem(
        trackingKey
      ) === "true"
    ) {
      return;
    }

    let cancelled = false;

    const trackPurchase =
      () => {
        if (cancelled) {
          return;
        }

        if (
          typeof window ===
            "undefined" ||
          typeof window.fbq !==
            "function"
        ) {
          return false;
        }

        try {
          window.fbq(
            "track",
            "Purchase",
            {
              value:
                purchaseValue,

              currency:
                "INR",

              content_name:
                "Personalized Lithophane Lamp",

              content_type:
                "product",
            }
          );

          localStorage.setItem(
            trackingKey,
            "true"
          );

          console.log(
            "Meta Purchase event sent:",
            {
              orderId:
                order.orderId,

              value:
                purchaseValue,

              currency:
                "INR",

              paymentMethod,
            }
          );

          return true;
        } catch (trackingError) {
          console.error(
            "Meta Purchase tracking error:",
            trackingError
          );

          return false;
        }
      };

    /*
     * MetaPixel is loaded globally with afterInteractive.
     * Give it time to initialize before giving up.
     */
    if (
      trackPurchase()
    ) {
      return () => {
        cancelled = true;
      };
    }

    let attempts = 0;

    const maxAttempts =
      100;

    const interval =
      window.setInterval(
        () => {
          attempts += 1;

          if (
            trackPurchase() ||
            attempts >=
              maxAttempts
          ) {
            window.clearInterval(
              interval
            );
          }
        },
        100
      );

    return () => {
      cancelled = true;

      window.clearInterval(
        interval
      );
    };
  }, [
    order,
  ]);

  const isCod =
    order?.paymentMethod ===
    "cod";

  const title =
    "Order Confirmed";

  const badge =
    isCod
      ? "ORDER CONFIRMED"
      : "PAYMENT SUCCESSFUL";

  const description =
    isCod
      ? "Thank you for your order. Your Cash on Delivery order has been confirmed and will now move forward for processing."
      : "Thank you for your order. Your payment has been successfully received and your RMX Nexus order is now confirmed.";

  const amountLabel =
    isCod
      ? "Amount Due on Delivery"
      : "Amount Paid";

  /*
   * COD uses the normal order total.
   *
   * Online uses the actual prepaid total after the additional
   * prepaid discount.
   */
  const displayedAmount =
    isCod
      ? order?.order?.total ||
        0
      : order?.prepaidTotal ||
        0;

  const message =
    isCod
      ? "Your order has been confirmed successfully. Payment of the displayed amount will be collected when your order is delivered."
      : "We have received your payment successfully. Your personalized order will now move to production.";

  return (
    <main
      style={{
        minHeight:
          "100vh",

        background:
          "#000",

        color:
          "#fff",

        fontFamily:
          "Arial, Helvetica, sans-serif",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "30px 20px",
      }}
    >
      <div
        style={{
          width:
            "100%",

          maxWidth:
            "620px",

          textAlign:
            "center",
        }}
      >
        <div
          style={{
            width:
              "72px",

            height:
              "72px",

            borderRadius:
              "50%",

            background:
              "rgba(34,211,238,.12)",

            border:
              "1px solid rgba(34,211,238,.4)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            margin:
              "0 auto 24px",

            fontSize:
              "32px",

            color:
              "#22d3ee",
          }}
        >
          ✓
        </div>

        <div
          style={{
            display:
              "inline-flex",

            border:
              "1px solid rgba(34,211,238,.35)",

            background:
              "rgba(34,211,238,.08)",

            color:
              "#22d3ee",

            borderRadius:
              "999px",

            padding:
              "7px 12px",

            fontSize:
              "10px",

            fontWeight:
              700,

            letterSpacing:
              "1px",

            marginBottom:
              "18px",
          }}
        >
          {badge}
        </div>

        <h1
          style={{
            fontSize:
              "clamp(34px, 6vw, 56px)",

            lineHeight:
              1,

            margin:
              "0 0 14px",

            fontWeight:
              800,

            letterSpacing:
              "-2px",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            color:
              "#999",

            fontSize:
              "14px",

            lineHeight:
              1.6,

            margin:
              "0 auto 30px",

            maxWidth:
              "500px",
          }}
        >
          {description}
        </p>

        <section
          style={{
            background:
              "#080808",

            border:
              "1px solid #242424",

            borderRadius:
              "16px",

            padding:
              "22px",

            textAlign:
              "left",
          }}
        >
          <div
            style={{
              color:
                "#22d3ee",

              fontSize:
                "10px",

              fontWeight:
                700,

              letterSpacing:
                "1px",

              marginBottom:
                "8px",
            }}
          >
            ORDER ID
          </div>

          <div
            style={{
              fontSize:
                "16px",

              fontWeight:
                700,

              marginBottom:
                "22px",

              wordBreak:
                "break-word",
            }}
          >
            {order?.orderId ||
              "Confirmed"}
          </div>

          <div
            style={{
              borderTop:
                "1px solid #222",

              paddingTop:
                "18px",

              display:
                "grid",

              gap:
                "14px",
            }}
          >
            <InfoRow
              label="Product"
              value="Personalized Lithophane Lamp"
            />

            <InfoRow
              label="Quantity"
              value={String(
                order?.order
                  ?.quantity ||
                  1
              )}
            />

            <InfoRow
              label="Size"
              value={formatLabel(
                order?.order
                  ?.size ||
                  "Standard"
              )}
            />

            <InfoRow
              label="Payment Method"
              value={
                isCod
                  ? "Cash on Delivery"
                  : "Online Payment"
              }
            />

            <InfoRow
              label={
                amountLabel
              }
              value={`₹${displayedAmount.toLocaleString(
                "en-IN"
              )}`}
            />

            {!isCod &&
              typeof order?.prepaidDiscount ===
                "number" &&
              order.prepaidDiscount >
                0 && (
                <InfoRow
                  label="Prepaid Discount"
                  value={`-₹${order.prepaidDiscount.toLocaleString(
                    "en-IN"
                  )}`}
                />
              )}

            {!isCod &&
              order?.razorpay
                ?.paymentId && (
                <InfoRow
                  label="Payment ID"
                  value={
                    order
                      .razorpay
                      .paymentId
                  }
                />
              )}
          </div>
        </section>

        <div
          style={{
            marginTop:
              "22px",

            background:
              "#080808",

            border:
              "1px solid #1d1d1d",

            borderRadius:
              "12px",

            padding:
              "16px",

            color:
              "#777",

            fontSize:
              "12px",

            lineHeight:
              1.6,
          }}
        >
          {message}
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/";
          }}
          style={{
            marginTop:
              "24px",

            border:
              "none",

            borderRadius:
              "10px",

            background:
              "#fff",

            color:
              "#000",

            padding:
              "14px 24px",

            fontWeight:
              800,

            fontSize:
              "12px",

            cursor:
              "pointer",
          }}
        >
          BACK TO RMX NEXUS
        </button>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display:
          "flex",

        justifyContent:
          "space-between",

        gap:
          "20px",

        alignItems:
          "flex-start",
      }}
    >
      <span
        style={{
          color:
            "#666",

          fontSize:
            "12px",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color:
            "#fff",

          fontSize:
            "12px",

          fontWeight:
            700,

          textAlign:
            "right",

          wordBreak:
            "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatLabel(
  value: string
) {
  return value
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}