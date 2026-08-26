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
  if (normalized === "grey" || normalized === "gray" || normalized === "graphite grey" || normalized === "graphite gray" || normalized === "classic grey") {
    return "grey";
  }
  return "black";
}

function normalizeLithophane(value: string | undefined): string {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "warm-white" || normalized === "warm white") {
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

  const quantity = Math.max(1, Math.min(10, Number(quantityValue) || 1));
  const price = SIZE_PRICES[size];
  const subtotal = price * quantity;
  const discount = quantity >= 2 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  return { size, frame, lithophane, quantity, price, subtotal, discount, total };
}

export default function ReviewPage() {
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "", mobile: "", email: "", address: "", city: "", state: "Maharashtra", pincode: "",
  });
  const [order, setOrder] = useState<OrderDetails>(calculateOrder("standard", "black", "warm-white", 1));
  const [photo, setPhoto] = useState<string>("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    try {
      const savedCustomer = localStorage.getItem("rmx_customer_details") || localStorage.getItem("customerDetails");
      if (savedCustomer) {
        const parsed = JSON.parse(savedCustomer);
        setCustomer({
          fullName: parsed.fullName || parsed.name || "",
          mobile: parsed.mobile || parsed.phone || "",
          email: parsed.email || "",
          address: parsed.address || parsed.completeAddress || "",
          city: parsed.city || "",
          state: parsed.state || "Maharashtra",
          pincode: parsed.pincode || parsed.pinCode || parsed.zip || "",
        });
      }

      let currentOrder: OrderDetails | null = null;
      const savedConfig = localStorage.getItem("rmx_checkout_config");

      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          currentOrder = calculateOrder(parsed.sizeId || parsed.size, parsed.frameId || parsed.frame, parsed.lithophaneId || parsed.lithophane, Number(parsed.quantity) || 1);
        } catch (error) { console.error("Invalid rmx_checkout_config:", error); }
      }

      if (!currentOrder) {
        const savedSessionOrder = sessionStorage.getItem("rmx_checkout_order");
        if (savedSessionOrder) {
          try {
            const parsed = JSON.parse(savedSessionOrder);
            currentOrder = calculateOrder(parsed.sizeId || parsed.size, parsed.frameId || parsed.frame, parsed.lithophaneId || parsed.lithophane, Number(parsed.quantity) || 1);
          } catch (error) { console.error("Invalid session checkout order:", error); }
        }
      }

      if (!currentOrder) {
        const savedFinalOrder = localStorage.getItem("rmx_final_order");
        if (savedFinalOrder) {
          try {
            const parsed = JSON.parse(savedFinalOrder);
            const source = parsed.order || parsed;
            currentOrder = calculateOrder(source.sizeId || source.size, source.frameId || source.frame, source.lithophaneId || source.lithophane, Number(source.quantity) || 1);
          } catch (error) { console.error("Invalid final order:", error); }
        }
      }

      if (!currentOrder) {
        const savedOrder = localStorage.getItem("rmx_order_details") || localStorage.getItem("orderDetails");
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            currentOrder = calculateOrder(parsed.sizeId || parsed.size, parsed.frameId || parsed.frame, parsed.lithophaneId || parsed.lithophane, Number(parsed.quantity) || 1);
          } catch (error) { console.error("Invalid old order storage:", error); }
        }
      }

      if (!currentOrder) {
        const params = new URLSearchParams(window.location.search);
        currentOrder = calculateOrder(params.get("size") || "standard", params.get("frame") || "black", params.get("lithophane") || "warm-white", Number(params.get("quantity") || "1"));
      }

      const finalOrder = calculateOrder(currentOrder.size, currentOrder.frame, currentOrder.lithophane, currentOrder.quantity);
      setOrder(finalOrder);

      sessionStorage.setItem("rmx_checkout_order", JSON.stringify(finalOrder));
      localStorage.setItem("rmx_order_details", JSON.stringify(finalOrder));
      localStorage.setItem("orderDetails", JSON.stringify(finalOrder));

      const savedPhoto = localStorage.getItem("rmx_checkout_photo") || localStorage.getItem("rmx_lithophane_photo") || localStorage.getItem("lithophanePhoto") || localStorage.getItem("uploadedPhoto") || "";
      if (savedPhoto) {
        setPhoto(savedPhoto);
        localStorage.setItem("rmx_checkout_photo", savedPhoto);
      }
    } catch (error) {
      console.error("Unable to load checkout information:", error);
    }
  }, []);

  const quantity = Math.max(1, order.quantity);
  const normalizedSize = normalizeSize(order.size);
  const unitPrice = SIZE_PRICES[normalizedSize];
  const subtotal = unitPrice * quantity;
  const discount = quantity >= 2 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const formatLabel = (value: string) => {
    return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const handleBack = () => {
    window.location.href = "/checkout/customer-details";
  };

  const handlePlaceOrder = () => {
    if (placingOrder) return;
    setPlacingOrder(true);

    const orderId = "RMX-" + Date.now().toString().slice(-8);

    const finalOrder = {
      orderId,
      status: "payment_pending",
      customer,
      order: {
        size: normalizedSize,
        frame: normalizeFrame(order.frame),
        lithophane: normalizeLithophane(order.lithophane),
        quantity,
        price: unitPrice,
        subtotal,
        discount,
        total,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("rmx_final_order", JSON.stringify(finalOrder));
      localStorage.setItem("rmx_order_id", orderId);

      const normalizedOrder = {
        size: normalizedSize,
        frame: normalizeFrame(order.frame),
        lithophane: normalizeLithophane(order.lithophane),
        quantity,
        price: unitPrice,
        subtotal,
        discount,
        total,
      };

      sessionStorage.setItem("rmx_checkout_order", JSON.stringify(normalizedOrder));
      localStorage.setItem("rmx_order_details", JSON.stringify(normalizedOrder));
      localStorage.setItem("orderDetails", JSON.stringify(normalizedOrder));

      if (photo) {
        localStorage.setItem("rmx_checkout_photo", photo);
      }

      window.location.href = "/checkout/payment";
    } catch (storageError) {
      console.error("RMX checkout storage error:", storageError);
      setPlacingOrder(false);
      alert("Unable to continue to payment. Please try again.");
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: "32px 20px 70px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
        <button type="button" onClick={handleBack} style={{ background: "transparent", border: "none", color: "#8b8b8b", fontSize: "12px", padding: 0, marginBottom: "18px", cursor: "pointer" }}>
          ← Back to customer details
        </button>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid rgba(34,211,238,.35)", background: "rgba(34,211,238,.08)", color: "#22d3ee", borderRadius: "999px", padding: "6px 11px", fontSize: "10px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>
          ✓ ORDER REVIEW
        </div>

        <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", lineHeight: 1, margin: "0 0 10px", fontWeight: 800, letterSpacing: "-1.5px" }}>Review Your Order</h1>
        <p style={{ color: "#8b8b8b", fontSize: "13px", margin: "0 0 30px" }}>Please check your personalized lamp, delivery details, and order total before continuing to payment.</p>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .8fr)", gap: "20px" }}>
          <section style={{ background: "#080808", border: "1px solid #242424", borderRadius: "16px", padding: "20px" }}>
            <h2 style={{ fontSize: "17px", margin: "0 0 18px" }}>Your personalized lamp</h2>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 260px) 1fr", gap: "22px" }}>
              <div style={{ overflow: "hidden", border: "1px solid #242424", borderRadius: "12px", background: "#000", minHeight: "260px" }}>
                {photo ? (
                  <img src={photo} alt="Uploaded lithophane photo" style={{ width: "100%", height: "100%", minHeight: "260px", objectFit: "contain", display: "block" }} />
                ) : (
                  <div style={{ minHeight: "260px", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: "12px", textAlign: "center", padding: "20px" }}>Photo preview unavailable</div>
                )}
              </div>
              <div>
                <div style={{ border: "1px solid rgba(34,211,238,.25)", background: "rgba(34,211,238,.05)", borderRadius: "12px", padding: "15px", marginBottom: "14px" }}>
                  <div style={{ color: "#22d3ee", fontSize: "9px", fontWeight: 700, letterSpacing: "1px", marginBottom: "8px" }}>YOUR SELECTION</div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>{formatLabel(normalizedSize)} · {formatLabel(order.lithophane)} · {formatLabel(order.frame)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <InfoBox label="SIZE" value={formatLabel(normalizedSize)} />
                  <InfoBox label="FRAME" value={formatLabel(normalizeFrame(order.frame))} />
                  <InfoBox label="LITHOPHANE" value={formatLabel(normalizeLithophane(order.lithophane))} />
                  <InfoBox label="QUANTITY" value={String(quantity)} />
                </div>
              </div>
            </div>
          </section>

          <section style={{ background: "#080808", border: "1px solid #242424", borderRadius: "16px", padding: "20px", height: "fit-content" }}>
            <h2 style={{ fontSize: "17px", margin: "0 0 18px" }}>Delivery details</h2>
            <InfoBox label="FULL NAME" value={customer.fullName || "—"} />
            <div style={{ marginTop: "10px" }}><InfoBox label="MOBILE" value={customer.mobile || "—"} /></div>
            {customer.email && <div style={{ marginTop: "10px" }}><InfoBox label="EMAIL" value={customer.email} /></div>}
            <div style={{ marginTop: "10px" }}><InfoBox label="ADDRESS" value={customer.address || "—"} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <InfoBox label="CITY" value={customer.city || "—"} />
              <InfoBox label="STATE" value={customer.state || "Maharashtra"} />
            </div>
            <div style={{ marginTop: "10px" }}><InfoBox label="PIN CODE" value={customer.pincode || "—"} /></div>
          </section>
        </div>

        <section style={{ marginTop: "20px", background: "#080808", border: "1px solid #242424", borderRadius: "16px", padding: "20px" }}>
          <h2 style={{ fontSize: "15px", margin: "0 0 15px" }}>Order total</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #222" }}>
            <span style={{ color: "#aaa", fontSize: "12px" }}>Personalized Lithophane × {quantity}</span>
            <span style={{ fontSize: "12px", fontWeight: 700 }}>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", color: "#34d399", fontSize: "12px" }}>
              <span>10% quantity discount</span>
              <span>-₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
            <strong style={{ fontSize: "15px" }}>Total</strong>
            <strong style={{ fontSize: "24px" }}>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          <button type="button" onClick={handlePlaceOrder} disabled={placingOrder} style={{ width: "100%", marginTop: "20px", border: "none", borderRadius: "10px", background: placingOrder ? "#555" : "#fff", color: placingOrder ? "#aaa" : "#000", padding: "14px 18px", fontWeight: 800, fontSize: "12px", cursor: placingOrder ? "wait" : "pointer" }}>
            {placingOrder ? "CONTINUING TO PAYMENT..." : "CONTINUE TO PAYMENT"}
          </button>
          <p style={{ textAlign: "center", color: "#555", fontSize: "10px", marginTop: "10px" }}>Secure checkout • Made to order • Fast shipping</p>
        </section>
      </div>
      <style jsx>{`
        @media (max-width: 800px) {
          main { padding: 24px 14px 50px !important; }
          main > div > div { grid-template-columns: 1fr !important; }
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #202020", borderRadius: "10px", padding: "10px 12px", background: "#050505" }}>
      <div style={{ color: "#555", fontSize: "8px", fontWeight: 700, letterSpacing: "1px", marginBottom: "5px" }}>{label}</div>
      <div style={{ color: "#ddd", fontSize: "11px", lineHeight: 1.4, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}