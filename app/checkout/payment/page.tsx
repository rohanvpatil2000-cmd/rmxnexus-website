"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => RazorpayInstance;
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (
    response: RazorpayResponse
  ) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type FinalOrder = {
  orderId: string;
  status: string;

  customer: {
    fullName: string;
    mobile: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  order: {
    size: string;
    frame: string;
    lithophane: string;
    quantity: number;
    price: number;
    subtotal?: number;
    discount?: number;
    total: number;
  };

  photo: string;
  createdAt: string;
};

type CreateOrderResponse = {
  success?: boolean;
  keyId?: string;
  amount?: number;
  currency?: string;
  orderId?: string;
  orderNumber?: string;
  databaseOrderId?: string;
  error?: string;
};

type VerifyResponse = {
  success?: boolean;
  message?: string;
  paymentId?: string;
  orderId?: string;
  databaseOrderId?: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  error?: string;
};

export default function PaymentPage() {
  const [order, setOrder] =
    useState<FinalOrder | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [razorpayLoaded, setRazorpayLoaded] =
    useState(false);

  /*
   * ---------------------------------------------------------
   * LOAD RAZORPAY
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    const loadRazorpay = async () => {
      try {
        /*
         * If Razorpay is already loaded,
         * use the existing instance.
         */
        if (window.Razorpay) {
          if (!cancelled) {
            setRazorpayLoaded(true);
          }

          return;
        }

        /*
         * Check whether another script is
         * already being loaded.
         */
        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
          await waitForRazorpay();

          if (!cancelled) {
            setRazorpayLoaded(
              !!window.Razorpay
            );
          }

          return;
        }

        /*
         * Create Razorpay script manually.
         */
        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        script.onload = () => {
          if (
            !cancelled &&
            window.Razorpay
          ) {
            setRazorpayLoaded(true);
          }
        };

        script.onerror = () => {
          if (!cancelled) {
            setError(
              "Unable to load Razorpay Checkout. Please refresh the page and try again."
            );
          }
        };

        document.body.appendChild(
          script
        );

        /*
         * Safety check in case onload
         * fires before React state updates.
         */
        await waitForRazorpay();

        if (!cancelled) {
          if (window.Razorpay) {
            setRazorpayLoaded(true);
          } else {
            setError(
              "Razorpay Checkout could not be loaded."
            );
          }
        }
      } catch (loadError) {
        console.error(
          "Razorpay loading error:",
          loadError
        );

        if (!cancelled) {
          setError(
            "Unable to load Razorpay Checkout."
          );
        }
      }
    };

    loadRazorpay();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOAD ORDER
   * ---------------------------------------------------------
   */
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "rmx_final_order"
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      setOrder(parsed);
    } catch (loadError) {
      console.error(
        "Unable to load payment information:",
        loadError
      );

      setError(
        "Unable to load your order information."
      );
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * BACK
   * ---------------------------------------------------------
   */
  const handleBack = () => {
    window.location.href =
      "/checkout/review";
  };

  /*
   * ---------------------------------------------------------
   * PAYMENT
   * ---------------------------------------------------------
   */
  const handlePayment = async () => {
    if (!order) {
      setError(
        "Order information is unavailable. Please return to review."
      );

      return;
    }

    if (loading) {
      return;
    }

    setError("");

    /*
     * Make absolutely sure Razorpay exists.
     */
    if (
      !razorpayLoaded ||
      !window.Razorpay
    ) {
      setError(
        "Razorpay is still loading. Please wait a moment and try again."
      );

      return;
    }

    /*
     * The customer-facing RMX order number
     * was created by /api/orders/create and
     * stored as order.orderId.
     *
     * IMPORTANT:
     * We now send this order number to the
     * server instead of sending size/quantity.
     *
     * The server will:
     * 1. Find the existing Supabase order.
     * 2. Read the trusted price from Supabase.
     * 3. Create the Razorpay order.
     * 4. Save razorpay_order_id back to Supabase.
     */
    if (!order.orderId) {
      setError(
        "RMX order number is missing. Please return to review and try again."
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * -----------------------------------------------------
       * CREATE RAZORPAY ORDER
       * -----------------------------------------------------
       *
       * IMPORTANT:
       * Do NOT send size and quantity here.
       *
       * The backend now uses the already-created
       * Supabase order as the source of truth.
       */
      const response =
        await fetch(
          "/api/razorpay/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              orderNumber:
                order.orderId,
            }),
          }
        );

      let data: CreateOrderResponse;

      try {
        data =
          (await response.json()) as CreateOrderResponse;
      } catch {
        throw new Error(
          "The payment server returned an invalid response."
        );
      }

      console.log(
        "Razorpay create-order response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to create Razorpay order."
        );
      }

      /*
       * Validate everything returned
       * by our backend BEFORE opening
       * Razorpay.
       */
      if (!data.keyId) {
        throw new Error(
          "Razorpay Key ID was not returned by the server."
        );
      }

      if (
        typeof data.amount !==
        "number"
      ) {
        throw new Error(
          "Razorpay amount was not returned correctly."
        );
      }

      if (!data.currency) {
        throw new Error(
          "Razorpay currency was not returned."
        );
      }

      if (!data.orderId) {
        throw new Error(
          "Razorpay order ID was not returned."
        );
      }

      if (data.amount <= 0) {
        throw new Error(
          "Invalid Razorpay payment amount."
        );
      }

      /*
       * Log the amount in rupees for debugging.
       *
       * Razorpay amount is in paise.
       *
       * ₹1 = 100 paise.
       */
      console.log(
        "Razorpay amount:",
        data.amount,
        "paise / ₹",
        data.amount / 100
      );

      /*
       * -----------------------------------------------------
       * RAZORPAY OPTIONS
       * -----------------------------------------------------
       */
      const options: RazorpayOptions = {
        key: data.keyId,

        amount: data.amount,

        currency:
          data.currency,

        name: "RMX Nexus",

        description:
          "Personalized Lithophane Lamp",

        order_id:
          data.orderId,

        prefill: {
          name:
            order.customer
              .fullName,

          email:
            order.customer.email,

          contact:
            order.customer.mobile,
        },

        notes: {
          RMXOrderId:
            order.orderId,

          size:
            order.order.size,

          quantity:
            String(
              order.order.quantity
            ),
        },

        theme: {
          color:
            "#22d3ee",
        },

        /*
         * ---------------------------------------------------
         * PAYMENT SUCCESS
         * ---------------------------------------------------
         */
        handler:
          async (
            paymentResponse
          ) => {
            try {
              console.log(
                "Razorpay payment response:",
                paymentResponse
              );

              /*
               * Verify payment on our server.
               *
               * The server will:
               * 1. Find the Supabase order using
               *    razorpay_order_id.
               * 2. Verify the Razorpay signature.
               * 3. Fetch the payment from Razorpay.
               * 4. Confirm amount/currency/order.
               * 5. Confirm payment is captured.
               * 6. Update Supabase:
               *      status = confirmed
               *      payment_status = paid
               *      razorpay_payment_id = pay_...
               */
              const verifyResponse =
                await fetch(
                  "/api/razorpay/verify",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body:
                      JSON.stringify(
                        paymentResponse
                      ),
                  }
                );

              let verifyData: VerifyResponse;

              try {
                verifyData =
                  (await verifyResponse.json()) as VerifyResponse;
              } catch {
                throw new Error(
                  "Payment verification server returned an invalid response."
                );
              }

              console.log(
                "Razorpay verification response:",
                verifyData
              );

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                throw new Error(
                  verifyData?.error ||
                    "Payment verification failed."
                );
              }

              /*
               * Server has now confirmed the payment
               * and updated the database.
               *
               * Keep the localStorage state synchronized
               * with the confirmed server result.
               */
              const updatedOrder = {
                ...order,

                status:
                  "payment_success",

                paymentStatus:
                  "paid",

                razorpay: {
                  paymentId:
                    paymentResponse.razorpay_payment_id,

                  orderId:
                    paymentResponse.razorpay_order_id,

                  signature:
                    paymentResponse.razorpay_signature,
                },

                databaseOrderId:
                  verifyData.databaseOrderId,

                paidAt:
                  new Date().toISOString(),
              };

              localStorage.setItem(
                "rmx_final_order",
                JSON.stringify(
                  updatedOrder
                )
              );

              localStorage.setItem(
                "rmx_payment_status",
                "success"
              );

              localStorage.setItem(
                "rmx_razorpay_payment_id",
                paymentResponse.razorpay_payment_id
              );

              /*
               * Keep the customer-facing
               * RMX order number available.
               */
              if (
                verifyData.orderNumber ||
                order.orderId
              ) {
                localStorage.setItem(
                  "rmx_order_id",
                  verifyData.orderNumber ||
                    order.orderId
                );
              }

              /*
               * Keep the database UUID available
               * when returned by the backend.
               */
              if (
                verifyData.databaseOrderId
              ) {
                localStorage.setItem(
                  "rmx_database_order_id",
                  verifyData.databaseOrderId
                );
              }

              /*
               * Go to success page.
               */
              window.location.href =
                "/checkout/success";
            } catch (
              verificationError
            ) {
              console.error(
                "Payment verification error:",
                verificationError
              );

              setLoading(false);

              setError(
                "Payment was received, but verification failed. Please do not pay again yet. Contact RMX Nexus."
              );
            }
          },

        /*
         * ---------------------------------------------------
         * RAZORPAY CLOSED
         * ---------------------------------------------------
         */
        modal: {
          ondismiss: () => {
            console.log(
              "Razorpay checkout closed."
            );

            setLoading(false);

            window.location.href =
              "/checkout/review";
          },
        },
      };

      /*
       * -----------------------------------------------------
       * OPEN RAZORPAY
       * -----------------------------------------------------
       */
      console.log(
        "Opening Razorpay..."
      );

      const RazorpayConstructor =
        window.Razorpay;

      if (!RazorpayConstructor) {
        throw new Error(
          "Razorpay Checkout is not available in the browser."
        );
      }

      const razorpay =
        new RazorpayConstructor(
          options
        );

      razorpay.open();

      /*
       * Razorpay.open() does not return
       * a Promise, so don't wait for it.
       *
       * The loading state remains active
       * until Razorpay closes or payment
       * verification finishes.
       */
    } catch (paymentError) {
      console.error(
        "Payment initiation error:",
        paymentError
      );

      setLoading(false);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * NO ORDER
   * ---------------------------------------------------------
   */
  if (!order) {
    return (
      <main
        style={{
          minHeight:
            "100vh",

          background:
            "#000",

          color:
            "#fff",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            textAlign:
              "center",

            padding:
              "30px",
          }}
        >
          <h1
            style={{
              fontSize:
                "28px",

              marginBottom:
                "10px",
            }}
          >
            Order information unavailable
          </h1>

          <p
            style={{
              color:
                "#888",

              fontSize:
                "13px",

              marginBottom:
                "20px",
            }}
          >
            Please return to the
            order review page and
            try again.
          </p>

          <button
            type="button"
            onClick={
              handleBack
            }
            style={{
              border:
                "none",

              borderRadius:
                "10px",

              background:
                "#fff",

              color:
                "#000",

              padding:
                "13px 20px",

              fontWeight:
                800,

              cursor:
                "pointer",
            }}
          >
            BACK TO REVIEW
          </button>
        </div>
      </main>
    );
  }

  const total =
    order.order.total;

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
            "900px",

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
              "#888",

            fontSize:
              "12px",

            padding:
              0,

            marginBottom:
              "20px",

            cursor:
              "pointer",
          }}
        >
          ← Back to order review
        </button>

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
          🔒 SECURE PAYMENT
        </div>

        <h1
          style={{
            fontSize:
              "clamp(32px, 5vw, 52px)",

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
          Complete Your Payment
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
          Your personalized RMX
          Nexus order is ready.
          Complete payment to
          confirm your order.
        </p>

        {error && (
          <div
            style={{
              marginBottom:
                "20px",

              border:
                "1px solid rgba(248,113,113,.3)",

              background:
                "rgba(248,113,113,.08)",

              color:
                "#fca5a5",

              borderRadius:
                "12px",

              padding:
                "14px",

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
              "1fr 300px",

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
              Payment methods
            </h2>

            <div
              style={{
                border:
                  "1px solid rgba(34,211,238,.35)",

                background:
                  "rgba(34,211,238,.04)",

                borderRadius:
                  "12px",

                padding:
                  "16px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "14px",

                  fontWeight:
                    700,

                  marginBottom:
                    "6px",
                }}
              >
                Online Payment
              </div>

              <div
                style={{
                  color:
                    "#777",

                  fontSize:
                    "12px",

                  lineHeight:
                    1.5,
                }}
              >
                UPI, credit card,
                debit card,
                netbanking and
                other supported
                Razorpay payment
                methods.
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "25px",

                border:
                  "1px solid #202020",

                borderRadius:
                  "12px",

                padding:
                  "16px",
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
                    "7px",
                }}
              >
                ORDER ID
              </div>

              <div
                style={{
                  fontSize:
                    "13px",

                  fontWeight:
                    700,
                }}
              >
                {order.orderId}
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "15px",

                border:
                  "1px solid #202020",

                borderRadius:
                  "12px",

                padding:
                  "16px",
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
                    "7px",
                }}
              >
                PAYMENT GATEWAY
              </div>

              <div
                style={{
                  fontSize:
                    "13px",

                  fontWeight:
                    700,
                }}
              >
                {razorpayLoaded
                  ? "Razorpay Ready ✓"
                  : "Loading Razorpay..."}
              </div>
            </div>
          </section>

          <aside
            style={{
              background:
                "#080808",

              border:
                "1px solid #242424",

              borderRadius:
                "16px",

              padding:
                "20px",

              height:
                "fit-content",
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
              Order summary
            </h2>

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "flex-start",

                gap:
                  "12px",

                paddingBottom:
                  "14px",

                borderBottom:
                  "1px solid #222",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "13px",

                    fontWeight:
                      700,
                  }}
                >
                  Personalized Lithophane
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",

                    color:
                      "#666",

                    fontSize:
                      "10px",
                  }}
                >
                  {formatLabel(
                    order.order.size
                  )}{" "}
                  ·{" "}
                  {formatLabel(
                    order.order.frame
                  )}
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",

                    color:
                      "#666",

                    fontSize:
                      "10px",
                  }}
                >
                  Quantity:{" "}
                  {
                    order.order
                      .quantity
                  }
                </div>
              </div>

              <div
                style={{
                  fontSize:
                    "13px",

                  fontWeight:
                    700,
                }}
              >
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>

            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                marginTop:
                  "18px",
              }}
            >
              <strong
                style={{
                  fontSize:
                    "16px",
                }}
              >
                Total
              </strong>

              <strong
                style={{
                  fontSize:
                    "24px",
                }}
              >
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <button
              type="button"
              onClick={
                handlePayment
              }
              disabled={
                loading ||
                !razorpayLoaded
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "22px",

                border:
                  "none",

                borderRadius:
                  "10px",

                background:
                  loading ||
                  !razorpayLoaded
                    ? "#555"
                    : "#fff",

                color:
                  loading ||
                  !razorpayLoaded
                    ? "#aaa"
                    : "#000",

                padding:
                  "14px 18px",

                fontWeight:
                  800,

                fontSize:
                  "12px",

                cursor:
                  loading
                    ? "wait"
                    : !razorpayLoaded
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "OPENING PAYMENT..."
                : !razorpayLoaded
                ? "LOADING RAZORPAY..."
                : "PROCEED TO PAYMENT"}
            </button>

            <p
              style={{
                textAlign:
                  "center",

                color:
                  "#555",

                fontSize:
                  "10px",

                lineHeight:
                  1.5,

                margin:
                  "12px 0 0",
              }}
            >
              Secure payment powered
              by Razorpay.
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
        }
      `}</style>
    </main>
  );
}

/*
 * -----------------------------------------------------------
 * WAIT FOR RAZORPAY
 * -----------------------------------------------------------
 */
function waitForRazorpay(
  timeout = 10000
): Promise<void> {
  return new Promise(
    (resolve) => {
      const started =
        Date.now();

      const check =
        () => {
          if (
            typeof window !==
              "undefined" &&
            window.Razorpay
          ) {
            resolve();
            return;
          }

          if (
            Date.now() -
              started >=
            timeout
          ) {
            resolve();
            return;
          }

          window.setTimeout(
            check,
            100
          );
        };

      check();
    }
  );
}

/*
 * -----------------------------------------------------------
 * FORMAT LABEL
 * -----------------------------------------------------------
 */
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