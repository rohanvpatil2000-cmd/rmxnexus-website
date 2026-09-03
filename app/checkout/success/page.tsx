"use client";

import { useEffect, useState } from "react";

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

  const isCod =
    order?.paymentMethod ===
    "cod";

  const title =
    isCod
      ? "Order Confirmed"
      : "Order Confirmed";

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
              value={`₹${(
                order?.order
                  ?.total ||
                0
              ).toLocaleString(
                "en-IN"
              )}`}
            />

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