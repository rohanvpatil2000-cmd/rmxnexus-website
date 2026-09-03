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
  databaseOrderId?: string;
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

  photo?: string;

  photos?: Array<{
    id?: string;
    storagePath?: string;
    originalName?: string;
    mimeType?: string;
    fileSize?: number;
    preview?: string;
  }>;

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

type CodResponse = {
  success?: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  databaseOrderId?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  error?: string;
};

type PaymentMethod = "online" | "cod";

export default function PaymentPage() {
  const [order, setOrder] =
    useState<FinalOrder | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("online");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [razorpayLoaded, setRazorpayLoaded] =
    useState(false);

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
        setError(
          "Order information is unavailable. Please return to review."
        );
        return;
      }

      const parsed =
        JSON.parse(saved) as FinalOrder;

      if (!parsed?.orderId) {
        setError(
          "Order information is incomplete. Please return to review."
        );
        return;
      }

      setOrder(parsed);

      /*
       * Restore previously selected payment
       * method if one exists.
       */
      const savedPaymentMethod =
        localStorage.getItem(
          "rmx_payment_method"
        );

      if (
        savedPaymentMethod === "cod" ||
        savedPaymentMethod === "online"
      ) {
        setPaymentMethod(
          savedPaymentMethod
        );
      }
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
   * LOAD RAZORPAY ONLY WHEN ONLINE PAYMENT IS SELECTED
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (
      paymentMethod !== "online" ||
      !order
    ) {
      return;
    }

    let cancelled = false;

    const loadRazorpay = async () => {
      try {
        /*
         * Already available.
         */
        if (window.Razorpay) {
          if (!cancelled) {
            setRazorpayLoaded(true);
          }

          return;
        }

        /*
         * Check for an existing Razorpay script.
         */
        const existingScript =
          document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

        if (existingScript) {
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

          return;
        }

        /*
         * Create Razorpay script.
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
  }, [
    paymentMethod,
    order,
  ]);

  /*
   * ---------------------------------------------------------
   * SELECT PAYMENT METHOD
   * ---------------------------------------------------------
   */
  const changePaymentMethod = (
    method: PaymentMethod
  ) => {
    if (loading) {
      return;
    }

    setError("");
    setPaymentMethod(method);

    localStorage.setItem(
      "rmx_payment_method",
      method
    );
  };

  /*
   * ---------------------------------------------------------
   * MAIN PAYMENT HANDLER
   * ---------------------------------------------------------
   */
  const handlePayment = async () => {
    if (loading) {
      return;
    }

    setError("");

    if (!order) {
      setError(
        "Order information is unavailable. Please return to review."
      );
      return;
    }

    if (!order.orderId) {
      setError(
        "Order number is missing. Please return to review."
      );
      return;
    }

    if (
      !order.databaseOrderId
    ) {
      setError(
        "Database order reference is missing. Please return to review."
      );
      return;
    }

    if (
      !order.order ||
      !order.order.total ||
      order.order.total <= 0
    ) {
      setError(
        "Invalid order amount."
      );
      return;
    }

    /*
     * -------------------------------------------------------
     * CASH ON DELIVERY
     * -------------------------------------------------------
     */
    if (
      paymentMethod === "cod"
    ) {
      setLoading(true);

      try {
        const response =
          await fetch(
            "/api/orders/confirm-cod",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                databaseOrderId:
                  order.databaseOrderId,

                orderNumber:
                  order.orderId,
              }),
            }
          );

        let data: CodResponse;

        try {
          data =
            (await response.json()) as CodResponse;
        } catch {
          throw new Error(
            "COD confirmation server returned an invalid response."
          );
        }

        console.log(
          "COD confirmation response:",
          data
        );

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.error ||
              "Unable to confirm Cash on Delivery order."
          );
        }

        /*
         * Server has confirmed the COD order.
         *
         * COD does NOT mark payment as paid.
         *
         * Expected database state:
         *
         * payment_method = cod
         * status = pending
         * payment_status = pending
         */
        const updatedOrder = {
          ...order,

          status:
            data.status ||
            "pending",

          paymentStatus:
            data.paymentStatus ||
            "pending",

          paymentMethod:
            "cod",

          databaseOrderId:
            data.databaseOrderId ||
            order.databaseOrderId,

          orderId:
            data.orderNumber ||
            order.orderId,

          codConfirmedAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          "rmx_final_order",
          JSON.stringify(
            updatedOrder
          )
        );

        localStorage.setItem(
          "rmx_payment_method",
          "cod"
        );

        localStorage.setItem(
          "rmx_payment_status",
          "pending"
        );

        if (
          data.orderNumber ||
          order.orderId
        ) {
          localStorage.setItem(
            "rmx_order_id",
            data.orderNumber ||
              order.orderId
          );
        }

        if (
          data.databaseOrderId ||
          order.databaseOrderId
        ) {
          localStorage.setItem(
            "rmx_database_order_id",
            data.databaseOrderId ||
              order.databaseOrderId
          );
        }

        /*
         * Go directly to success page.
         *
         * Razorpay is NOT opened.
         */
        window.location.href =
          "/checkout/success";
      } catch (codError) {
        console.error(
          "COD confirmation error:",
          codError
        );

        setLoading(false);

        setError(
          codError instanceof Error
            ? codError.message
            : "Unable to confirm Cash on Delivery order."
        );
      }

      return;
    }

    /*
     * -------------------------------------------------------
     * ONLINE PAYMENT
     * -------------------------------------------------------
     */

    setLoading(true);

    try {
      /*
       * Make absolutely sure Razorpay
       * exists before starting.
       */
      if (!window.Razorpay) {
        await waitForRazorpay();
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout is not available in the browser."
        );
      }

      /*
       * Create or retrieve the Razorpay
       * order from our secure server.
       */
      console.log(
        "Creating Razorpay order for RMX order:",
        order.orderId
      );

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
          "Razorpay order server returned an invalid response."
        );
      }

      console.log(
        "Razorpay create-order response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.error ||
            "Unable to create Razorpay order."
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
        key:
          data.keyId || "",

        amount:
          data.amount,

        currency:
          data.currency,

        name:
          "RMX Nexus",

        description:
          "Personalized Lithophane Lamp",

        order_id:
          data.orderId,

        prefill: {
          name:
            order.customer.fullName,

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
               * Server has now confirmed
               * the payment and updated
               * the database.
               */
              const updatedOrder = {
                ...order,

                status:
                  "payment_success",

                paymentStatus:
                  "paid",

                paymentMethod:
                  "online",

                razorpay: {
                  paymentId:
                    paymentResponse.razorpay_payment_id,

                  orderId:
                    paymentResponse.razorpay_order_id,

                  signature:
                    paymentResponse.razorpay_signature,
                },

                databaseOrderId:
                  verifyData.databaseOrderId ||
                  order.databaseOrderId,

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
                "rmx_payment_method",
                "online"
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
               * Keep customer-facing
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
               * Keep database UUID available.
               */
              if (
                verifyData.databaseOrderId ||
                order.databaseOrderId
              ) {
                localStorage.setItem(
                  "rmx_database_order_id",
                  verifyData.databaseOrderId ||
                    order.databaseOrderId ||
                    ""
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
              "560px",

            textAlign:
              "center",
          }}
        >
          <div
            style={{
              width:
                "64px",

              height:
                "64px",

              borderRadius:
                "50%",

              border:
                "1px solid rgba(34,211,238,.35)",

              background:
                "rgba(34,211,238,.08)",

              color:
                "#22d3ee",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              margin:
                "0 auto 20px",

              fontSize:
                "28px",
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize:
                "32px",

              margin:
                "0 0 12px",

              fontWeight:
                800,
            }}
          >
            Payment
          </h1>

          <p
            style={{
              color:
                "#888",

              fontSize:
                "14px",

              lineHeight:
                1.6,

              margin:
                "0 0 24px",
            }}
          >
            {error ||
              "Loading your order information..."}
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/checkout/review";
            }}
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
                "13px 22px",

              fontWeight:
                800,

              fontSize:
                "12px",

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

  /*
   * ---------------------------------------------------------
   * PAYMENT PAGE
   * ---------------------------------------------------------
   */
  const total =
    order.order.total || 0;

  const quantity =
    order.order.quantity || 1;

  const onlineReady =
    razorpayLoaded;

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

        padding:
          "30px 20px 60px",
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
          onClick={() => {
            if (!loading) {
              window.location.href =
                "/checkout/review";
            }
          }}
          style={{
            border:
              "none",

            background:
              "transparent",

            color:
              "#777",

            fontSize:
              "11px",

            cursor:
              loading
                ? "default"
                : "pointer",

            padding:
              "0",

            marginBottom:
              "20px",
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
              "7px 12px",

            fontSize:
              "9px",

            fontWeight:
              700,

            letterSpacing:
              "1px",

            marginBottom:
              "16px",
          }}
        >
          SECURE CHECKOUT
        </div>

        <h1
          style={{
            fontSize:
              "clamp(34px, 6vw, 54px)",

            lineHeight:
              1,

            margin:
              "0 0 12px",

            fontWeight:
              800,

            letterSpacing:
              "-2px",
          }}
        >
          Choose Your Payment
        </h1>

        <p
          style={{
            color:
              "#888",

            fontSize:
              "13px",

            lineHeight:
              1.6,

            margin:
              "0 0 30px",

            maxWidth:
              "560px",
          }}
        >
          Select how you would like to pay for your personalized RMX Nexus
          order.
        </p>

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "minmax(0, 1fr) 300px",

            gap:
              "18px",

            alignItems:
              "start",
          }}
        >
          <section
            style={{
              background:
                "#080808",

              border:
                "1px solid #202020",

              borderRadius:
                "16px",

              padding:
                "20px",
            }}
          >
            <div
              style={{
                color:
                  "#999",

                fontSize:
                  "9px",

                fontWeight:
                  700,

                letterSpacing:
                  "1px",

                marginBottom:
                  "12px",
              }}
            >
              PAYMENT METHOD
            </div>

            <div
              style={{
                display:
                  "grid",

                gap:
                  "12px",
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  changePaymentMethod(
                    "online"
                  )
                }
                style={{
                  width:
                    "100%",

                  textAlign:
                    "left",

                  border:
                    paymentMethod ===
                    "online"
                      ? "1px solid #22d3ee"
                      : "1px solid #242424",

                  background:
                    paymentMethod ===
                    "online"
                      ? "rgba(34,211,238,.07)"
                      : "#050505",

                  color:
                    "#fff",

                  borderRadius:
                    "14px",

                  padding:
                    "17px",

                  cursor:
                    loading
                      ? "default"
                      : "pointer",

                  opacity:
                    loading
                      ? 0.7
                      : 1,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "12px",
                  }}
                >
                  <div
                    style={{
                      width:
                        "38px",

                      height:
                        "38px",

                      borderRadius:
                        "10px",

                      background:
                        "rgba(34,211,238,.1)",

                      border:
                        "1px solid rgba(34,211,238,.25)",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      fontSize:
                        "17px",
                    }}
                  >
                    ₹
                  </div>

                  <div
                    style={{
                      flex:
                        1,
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "14px",

                        fontWeight:
                          800,
                      }}
                    >
                      Online Payment
                    </div>

                    <div
                      style={{
                        color:
                          "#777",

                        fontSize:
                          "11px",

                        marginTop:
                          "4px",

                        lineHeight:
                          1.5,
                      }}
                    >
                      Pay securely using Razorpay.
                    </div>
                  </div>

                  <div
                    style={{
                      width:
                        "18px",

                      height:
                        "18px",

                      borderRadius:
                        "50%",

                      border:
                        paymentMethod ===
                        "online"
                          ? "5px solid #22d3ee"
                          : "1px solid #555",
                    }}
                  />
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  changePaymentMethod(
                    "cod"
                  )
                }
                style={{
                  width:
                    "100%",

                  textAlign:
                    "left",

                  border:
                    paymentMethod ===
                    "cod"
                      ? "1px solid #22d3ee"
                      : "1px solid #242424",

                  background:
                    paymentMethod ===
                    "cod"
                      ? "rgba(34,211,238,.07)"
                      : "#050505",

                  color:
                    "#fff",

                  borderRadius:
                    "14px",

                  padding:
                    "17px",

                  cursor:
                    loading
                      ? "default"
                      : "pointer",

                  opacity:
                    loading
                      ? 0.7
                      : 1,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "12px",
                  }}
                >
                  <div
                    style={{
                      width:
                        "38px",

                      height:
                        "38px",

                      borderRadius:
                        "10px",

                      background:
                        "rgba(34,211,238,.1)",

                      border:
                        "1px solid rgba(34,211,238,.25)",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      fontSize:
                        "17px",
                    }}
                  >
                    📦
                  </div>

                  <div
                    style={{
                      flex:
                        1,
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "14px",

                        fontWeight:
                          800,
                      }}
                    >
                      Cash on Delivery
                    </div>

                    <div
                      style={{
                        color:
                          "#777",

                        fontSize:
                          "11px",

                        marginTop:
                          "4px",

                        lineHeight:
                          1.5,
                      }}
                    >
                      Pay when your personalized order is delivered.
                    </div>
                  </div>

                  <div
                    style={{
                      width:
                        "18px",

                      height:
                        "18px",

                      borderRadius:
                        "50%",

                      border:
                        paymentMethod ===
                        "cod"
                          ? "5px solid #22d3ee"
                          : "1px solid #555",
                    }}
                  />
                </div>
              </button>
            </div>

            {paymentMethod ===
              "online" && (
              <div
                style={{
                  marginTop:
                    "16px",

                  border:
                    "1px solid #202020",

                  background:
                    "#050505",

                  borderRadius:
                    "12px",

                  padding:
                    "14px",

                  color:
                    "#777",

                  fontSize:
                    "11px",

                  lineHeight:
                    1.6,
                }}
              >
                <strong
                  style={{
                    color:
                      "#bbb",
                  }}
                >
                  Online payment
                </strong>
                <br />
                You will be redirected to the secure Razorpay checkout to
                complete payment.
              </div>
            )}

            {paymentMethod ===
              "cod" && (
              <div
                style={{
                  marginTop:
                    "16px",

                  border:
                    "1px solid rgba(34,211,238,.18)",

                  background:
                    "rgba(34,211,238,.04)",

                  borderRadius:
                    "12px",

                  padding:
                    "14px",

                  color:
                    "#888",

                  fontSize:
                    "11px",

                  lineHeight:
                    1.6,
                }}
              >
                <strong
                  style={{
                    color:
                      "#22d3ee",
                  }}
                >
                  Cash on Delivery
                </strong>
                <br />
                Your order will be confirmed now. Payment will remain pending
                until the amount is collected on delivery.
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop:
                    "16px",

                  border:
                    "1px solid rgba(248,113,113,.25)",

                  background:
                    "rgba(248,113,113,.06)",

                  color:
                    "#fca5a5",

                  borderRadius:
                    "12px",

                  padding:
                    "13px 14px",

                  fontSize:
                    "11px",

                  lineHeight:
                    1.6,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={
                handlePayment
              }
              disabled={
                loading ||
                !order
              }
              style={{
                width:
                  "100%",

                marginTop:
                  "20px",

                border:
                  "none",

                borderRadius:
                  "12px",

                background:
                  loading
                    ? "#333"
                    : "#fff",

                color:
                  loading
                    ? "#888"
                    : "#000",

                padding:
                  "15px 20px",

                fontWeight:
                  800,

                fontSize:
                  "12px",

                cursor:
                  loading
                    ? "default"
                    : "pointer",

                transition:
                  "all .2s",
              }}
            >
              {loading
                ? "PROCESSING..."
                : paymentMethod ===
                    "cod"
                  ? "CONFIRM CASH ON DELIVERY"
                  : onlineReady
                    ? "PROCEED TO ONLINE PAYMENT"
                    : "LOADING RAZORPAY..."}
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
              Secure checkout • Made to order • Fast shipping
            </p>
          </section>

          <aside
            style={{
              background:
                "#080808",

              border:
                "1px solid #202020",

              borderRadius:
                "16px",

              padding:
                "20px",

              height:
                "fit-content",
            }}
          >
            <div
              style={{
                color:
                  "#999",

                fontSize:
                  "9px",

                fontWeight:
                  700,

                letterSpacing:
                  "1px",

                marginBottom:
                  "14px",
              }}
            >
              ORDER SUMMARY
            </div>

            <div
              style={{
                border:
                  "1px solid #202020",

                borderRadius:
                  "12px",

                background:
                  "#050505",

                padding:
                  "14px",

                marginBottom:
                  "14px",
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
                    "6px",
                }}
              >
                RMX ORDER
              </div>

              <div
                style={{
                  color:
                    "#ddd",

                  fontSize:
                    "11px",

                  fontWeight:
                    700,

                  wordBreak:
                    "break-word",
                }}
              >
                {order.orderId}
              </div>
            </div>

            <InfoBox
              label="PRODUCT"
              value="Personalized Lithophane Lamp"
            />

            <InfoBox
              label="SIZE"
              value={formatLabel(
                order.order.size
              )}
            />

            <InfoBox
              label="QUANTITY"
              value={String(
                quantity
              )}
            />

            <InfoBox
              label="PAYMENT"
              value={
                paymentMethod ===
                "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"
              }
            />

            <div
              style={{
                borderTop:
                  "1px solid #202020",

                marginTop:
                  "16px",

                paddingTop:
                  "16px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  color:
                    "#777",

                  fontSize:
                    "11px",

                  marginBottom:
                    "8px",
                }}
              >
                <span>
                  Subtotal
                </span>

                <span>
                  ₹{(
                    order.order.subtotal ??
                    total
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {(order.order.discount ??
                0) >
                0 && (
                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    color:
                      "#34d399",

                    fontSize:
                      "11px",

                    marginBottom:
                      "8px",
                  }}
                >
                  <span>
                    Discount
                  </span>

                  <span>
                    -₹{(
                      order.order.discount ??
                      0
                    ).toLocaleString(
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

                  alignItems:
                    "center",

                  marginTop:
                    "12px",
                }}
              >
                <span
                  style={{
                    color:
                      "#fff",

                    fontSize:
                      "13px",

                    fontWeight:
                      800,
                  }}
                >
                  {paymentMethod ===
                  "cod"
                    ? "Amount Due"
                    : "Total"}
                </span>

                <span
                  style={{
                    color:
                      "#fff",

                    fontSize:
                      "21px",

                    fontWeight:
                      900,
                  }}
                >
                  ₹{total.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  "16px",

                border:
                  "1px solid #202020",

                borderRadius:
                  "10px",

                padding:
                  "11px 12px",

                background:
                  "#050505",

                color:
                  "#666",

                fontSize:
                  "10px",

                lineHeight:
                  1.5,
              }}
            >
              {paymentMethod ===
              "cod"
                ? "Payment will be collected when your order is delivered."
                : "Your payment is processed securely through Razorpay."}
            </div>
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

/*
 * -----------------------------------------------------------
 * INFO BOX
 * -----------------------------------------------------------
 */
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

        marginBottom:
          "8px",
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