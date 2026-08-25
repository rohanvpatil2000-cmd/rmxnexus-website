"use client";

import { useState } from "react";
import Link from "next/link";

type SizeOption = {
  id: string;
  name: string;
  dimensions: string;
  price: number;
  label?: string;
};

const sizeOptions: SizeOption[] = [
  {
    id: "mini",
    name: "Mini",
    dimensions: "12 × 12 cm",
    price: 799,
  },
  {
    id: "standard",
    name: "Standard",
    dimensions: "15 × 15 cm",
    price: 999,
    label: "BEST VALUE",
  },
  {
    id: "large",
    name: "Large",
    dimensions: "20 × 20 cm",
    price: 1399,
    label: "MOST IMPRESSIVE",
  },
];

const frameOptions = [
  {
    id: "black",
    name: "Black",
  },
  {
    id: "grey",
    name: "Grey",
  },
];

export default function LithophaneLampPage() {
  const [
    selectedSize,
    setSelectedSize,
  ] = useState("standard");

  const [
    selectedFrame,
    setSelectedFrame,
  ] = useState("black");

  const [
    selectedQuantity,
    setSelectedQuantity,
  ] = useState(1);

  const selectedSizeData =
    sizeOptions.find(
      (size) =>
        size.id === selectedSize
    ) ??
    sizeOptions[1];

  const selectedFrameData =
    frameOptions.find(
      (frame) =>
        frame.id ===
        selectedFrame
    ) ??
    frameOptions[0];

  const subtotal =
    selectedSizeData.price *
    selectedQuantity;

  const discount =
    selectedQuantity >= 2
      ? Math.round(
          subtotal * 0.1
        )
      : 0;

  const total =
    subtotal - discount;

  const goToCheckout = () => {
    /*
     * IMPORTANT:
     *
     * Send canonical lowercase IDs.
     *
     * mini
     * standard
     * large
     *
     * black
     * grey
     *
     * natural-white
     */
    const params =
      new URLSearchParams({
        size:
          selectedSizeData.id,

        frame:
          selectedFrameData.id,

        lithophane:
          "natural-white",

        quantity:
          String(
            selectedQuantity
          ),
      });

    window.location.href =
      `/checkout?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">

          <Link
            href="/"
            className="text-sm font-black tracking-[0.35em]"
          >
            RMX NEXUS
          </Link>

          <Link
            href="/#products"
            className="rounded-full border border-white/15 px-5 py-2 text-sm transition hover:border-cyan-400 hover:bg-white hover:text-black"
          >
            Products
          </Link>

        </div>
      </nav>

      {/* SHIPPING BANNER */}
      <div className="border-b border-cyan-400/20 bg-cyan-400/[0.08]">
        <div className="mx-auto max-w-7xl px-5 py-3 text-center md:px-8">

          <p className="text-xs font-black tracking-wide text-cyan-300 sm:text-sm">
            🎁 RAKSHA BANDHAN GIFTING • FREE PAN-INDIA DELIVERY • FAST
            SHIPPING • EST. 2–4 DAYS
          </p>

        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">

        <div className="pointer-events-none absolute left-1/2 top-0 h-[650px] w-[1000px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[160px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-10 md:px-8 md:py-16 lg:grid-cols-2 lg:gap-20">

          {/* PRODUCT VISUAL */}
          <div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707] shadow-2xl">

              <div className="aspect-square">

                <img
                  src="/images/lithophane.jpg"
                  alt="Personalized 3D printed lithophane LED lamp with black frame"
                  className="h-full w-full object-cover"
                />

              </div>

              <div className="absolute left-5 top-5 rounded-full border border-cyan-400/30 bg-black/75 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-cyan-300 backdrop-blur-md md:left-6 md:top-6 md:text-xs">
                BEST SELLER
              </div>

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/75 p-4 backdrop-blur-md">

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Your photo → 3D illuminated memory
                </p>

                <p className="mt-1 text-sm text-gray-300">
                  Personalized and made to order by RMX Nexus.
                </p>

              </div>
            </div>

            {/* TRUST */}
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center md:p-4">
                <div className="text-lg">
                  🎨
                </div>

                <p className="mt-1 text-[11px] font-semibold text-gray-300 md:text-xs">
                  Personalized
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center md:p-4">
                <div className="text-lg">
                  🖨️
                </div>

                <p className="mt-1 text-[11px] font-semibold text-gray-300 md:text-xs">
                  3D Printed
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center md:p-4">
                <div className="text-lg">
                  🚚
                </div>

                <p className="mt-1 text-[11px] font-semibold text-gray-300 md:text-xs">
                  Free Delivery
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center md:p-4">
                <div className="text-lg">
                  ⚡
                </div>

                <p className="mt-1 text-[11px] font-semibold text-gray-300 md:text-xs">
                  2–4 Days*
                </p>
              </div>

            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">

              <p className="text-sm font-bold">
                A photograph transformed into illuminated 3D art.
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                The lithophane remains white for the best light transmission.
                You can choose the outer frame colour.
              </p>

            </div>

          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex flex-col justify-center">

            <p className="text-xs font-bold tracking-[0.35em] text-cyan-400">
              RMX NEXUS • PERSONALIZED COLLECTION
            </p>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Personalized
              <br />
              Lithophane
              <br />
              LED Lamp
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-400 md:text-lg md:leading-8">
              Turn your favourite photograph into a beautiful illuminated
              3D keepsake — made specifically for you.
            </p>

            {/* OFFER */}
            <div className="mt-7 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">

              <div className="flex items-start gap-3">

                <div className="text-xl">
                  🎁
                </div>

                <div>

                  <p className="text-sm font-black text-cyan-300">
                    BUY 2 OR MORE & GET 10% OFF
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Discount is applied automatically when quantity reaches 2.
                  </p>

                </div>

              </div>

            </div>

            {/* PRICE */}
            <div className="mt-7">

              <div className="flex flex-wrap items-end gap-3">

                <span className="text-4xl font-black md:text-5xl">
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {discount > 0 && (
                  <span className="pb-1 text-sm font-semibold text-cyan-400">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}{" "}
                    → 10% OFF
                  </span>
                )}

              </div>

              <p className="mt-2 text-xs text-gray-500">
                {selectedSizeData.dimensions} •{" "}
                {selectedFrameData.name} frame • White lithophane
              </p>

              <p className="mt-1 text-xs font-semibold text-cyan-400">
                FREE PAN-INDIA DELIVERY
              </p>

            </div>

            {/* SIZE */}
            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between gap-4">

                <p className="text-sm font-bold">
                  Select Size
                </p>

                <span className="text-xs text-gray-500">
                  Current:{" "}
                  {selectedSizeData.dimensions}
                </span>

              </div>

              <div className="grid gap-3 sm:grid-cols-3">

                {sizeOptions.map(
                  (size) => {
                    const isSelected =
                      selectedSize ===
                      size.id;

                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() =>
                          setSelectedSize(
                            size.id
                          )
                        }
                        className={`relative rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-400 text-black"
                            : "border-white/15 bg-white/[0.02] text-white hover:border-white/40"
                        }`}
                      >

                        {size.label && (
                          <span
                            className={`absolute -top-2 right-3 rounded-full px-2 py-1 text-[9px] font-black tracking-wide ${
                              isSelected
                                ? "bg-black text-cyan-300"
                                : "bg-cyan-400 text-black"
                            }`}
                          >
                            {size.label}
                          </span>
                        )}

                        <p className="text-sm font-black">
                          {size.name}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            isSelected
                              ? "text-black/70"
                              : "text-gray-500"
                          }`}
                        >
                          {size.dimensions}
                        </p>

                        <p className="mt-3 text-lg font-black">
                          ₹
                          {size.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* FRAME */}
            <div className="mt-7">

              <div className="mb-4 flex items-center justify-between">

                <p className="text-sm font-bold">
                  Frame Colour
                </p>

                <span className="text-xs text-gray-500">
                  Lithophane: White
                </span>

              </div>

              <div className="flex flex-wrap gap-3">

                {frameOptions.map(
                  (frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() =>
                        setSelectedFrame(
                          frame.id
                        )
                      }
                      className={`flex items-center gap-3 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                        selectedFrame ===
                        frame.id
                          ? "border-cyan-400 bg-cyan-400 text-black"
                          : "border-white/15 text-white hover:border-white/40"
                      }`}
                    >

                      <span
                        className={`h-4 w-4 rounded-full border border-black/30 ${
                          frame.id ===
                          "black"
                            ? "bg-black"
                            : "bg-gray-500"
                        }`}
                      />

                      {frame.name}

                    </button>
                  )
                )}

              </div>

            </div>

            {/* QUANTITY */}
            <div className="mt-7">

              <div className="mb-4 flex items-center justify-between">

                <p className="text-sm font-bold">
                  Quantity
                </p>

                {selectedQuantity >=
                  2 && (
                  <span className="text-xs font-bold text-cyan-400">
                    10% discount unlocked ✓
                  </span>
                )}

              </div>

              <div className="flex items-center gap-4">

                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setSelectedQuantity(
                      Math.max(
                        1,
                        selectedQuantity -
                          1
                      )
                    )
                  }
                  className="h-11 w-11 rounded-full border border-white/15 text-lg transition hover:border-cyan-400 hover:bg-white hover:text-black"
                >
                  −
                </button>

                <span className="w-8 text-center font-bold">
                  {selectedQuantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setSelectedQuantity(
                      Math.min(
                        10,
                        selectedQuantity +
                          1
                      )
                    )
                  }
                  className="h-11 w-11 rounded-full border border-white/15 text-lg transition hover:border-cyan-400 hover:bg-white hover:text-black"
                >
                  +
                </button>

              </div>

            </div>

            {/* DELIVERY */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-sm font-bold">
                  🚚 Free Delivery
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Free shipping across India.
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

                <p className="text-sm font-bold">
                  ⚡ Fast Shipping
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Estimated delivery: 2–4 days after dispatch.*
                </p>

              </div>

            </div>

            {/* BUY NOW */}
            <button
              type="button"
              onClick={
                goToCheckout
              }
              className="mt-9 flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-center text-sm font-black text-black transition duration-300 hover:scale-[1.02] hover:bg-cyan-400 md:text-base"
            >
              BUY NOW →
            </button>

            <p className="mt-4 text-center text-xs leading-6 text-gray-500">
              Upload your photo and complete your order securely at checkout.
            </p>

            {/* PAYMENT / TRUST */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-sm">
                  💳
                </p>

                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Secure Payment
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-sm">
                  📦
                </p>

                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  Made to Order
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
                <p className="text-sm">
                  🇮🇳
                </p>

                <p className="mt-1 text-[11px] font-semibold text-gray-400">
                  All India
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* WHAT YOU RECEIVE */}
      <section className="border-t border-white/10 bg-[#050505] py-20">

        <div className="mx-auto max-w-7xl px-5 md:px-8">

          <div className="max-w-3xl">

            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
              WHAT YOU RECEIVE
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              More than a photograph.
              <br />
              It becomes a keepsake.
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Your selected photograph is transformed into a physical
              illuminated 3D artwork designed for display and gifting.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "01",
                "Personalized Artwork",
                "Created from the photograph you provide.",
              ],
              [
                "02",
                "3D Printed Lithophane",
                "A physical white lithophane panel that reveals the image when illuminated.",
              ],
              [
                "03",
                "LED Illumination",
                "Designed to display your memory beautifully with warm light.",
              ],
              [
                "04",
                "Gift-Ready Concept",
                "Ideal for birthdays, anniversaries, couples, parents and special occasions.",
              ],
            ].map(
              ([
                number,
                title,
                description,
              ]) => (
                <div
                  key={number}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
                >

                  <div className="text-2xl text-cyan-400">
                    {number}
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {description}
                  </p>

                </div>
              )
            )}

          </div>
        </div>
      </section>

      {/* SIZE */}
      <section className="border-t border-white/10 bg-black py-20">

        <div className="mx-auto max-w-7xl px-5 md:px-8">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            <div>

              <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
                SIZE & FIT
              </p>

              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                Know the size
                <br />
                before ordering.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-gray-400">
                Choose the size that fits your space and gifting needs.
                Dimensions below refer to the lithophane/display size.
              </p>

              <div className="mt-7 space-y-3">

                {sizeOptions.map(
                  (size) => (
                    <div
                      key={size.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
                    >

                      <div>

                        <p className="text-sm font-bold">
                          {size.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {size.dimensions}
                        </p>

                      </div>

                      <p className="font-black">
                        ₹
                        {size.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>
                  )
                )}

              </div>

              <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">

                <p className="text-sm font-bold">
                  📏 Scale shown in catalog
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  We will use a clear measurement reference image in the
                  catalog so customers can understand the physical size before
                  ordering.
                </p>

              </div>

            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02]">

              <img
                src="/images/lithophane.jpg"
                alt="Lithophane lamp size reference placeholder"
                className="aspect-square h-full w-full object-cover"
              />

            </div>

          </div>

        </div>

      </section>

      {/* PHOTO REQUIREMENTS */}
      <section className="border-t border-white/10 bg-[#050505] py-20">

        <div className="mx-auto max-w-7xl px-5 md:px-8">

          <div className="max-w-3xl">

            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
              BEFORE YOU ORDER
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Choose the right photograph.
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              The quality of the original photograph plays an important role in
              the final lithophane.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "✓",
                "Clear Photograph",
                "Use the highest-quality original photograph available.",
              ],
              [
                "✓",
                "Good Lighting",
                "Photos with visible facial and subject details generally work better.",
              ],
              [
                "✓",
                "Important Subject",
                "Keep the person or subject you want to highlight clearly visible.",
              ],
              [
                "✓",
                "We Review It",
                "Send your photograph and we can review it before production.",
              ],
            ].map(
              ([
                icon,
                title,
                description,
              ]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
                >

                  <div className="text-2xl text-cyan-400">
                    {icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {description}
                  </p>

                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 py-20">

        <div className="mx-auto max-w-7xl px-5 md:px-8">

          <div className="text-center">

            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
              SIMPLE PROCESS
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              From Photo to Lamp
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-500">
              No complicated customization process. Send your photograph,
              confirm the details, and we handle the production.
            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {[
              [
                "01",
                "Choose your photo",
                "Select the memory you want to transform into your personalized lithophane.",
              ],
              [
                "02",
                "We prepare your design",
                "Your photograph is converted into a printable 3D lithophane design.",
              ],
              [
                "03",
                "We print & deliver",
                "After confirmation, your personalized product is produced and prepared for delivery.",
              ],
            ].map(
              ([
                number,
                title,
                description,
              ]) => (
                <div
                  key={number}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
                >

                  <span className="text-4xl font-black text-cyan-400">
                    {number}
                  </span>

                  <h3 className="mt-6 text-xl font-bold">
                    {title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-400">
                    {description}
                  </p>

                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* PERFECT FOR */}
      <section className="border-t border-white/10 bg-[#050505] py-20">

        <div className="mx-auto max-w-7xl px-5 md:px-8">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
                MADE FOR MEMORIES
              </p>

              <h2 className="mt-4 text-3xl font-black md:text-5xl">
                A gift that feels personal.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-gray-400">
                Instead of giving another ordinary photo frame, turn a
                meaningful photograph into an illuminated 3D keepsake.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3">

              {[
                "Birthdays",
                "Anniversaries",
                "Couples",
                "Parents",
                "Family",
                "Weddings",
                "Festivals",
                "Special Memories",
              ].map(
                (occasion) => (
                  <div
                    key={occasion}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm font-semibold text-gray-300"
                  >
                    {occasion}
                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-20">

        <div className="mx-auto max-w-4xl px-5 md:px-8">

          <div className="text-center">

            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
              QUESTIONS
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Frequently Asked Questions
            </h2>

          </div>

          <div className="mt-12 space-y-4">

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                How do I send my photograph?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Click BUY NOW and complete your order through our secure
                checkout. You will be able to provide the required details
                during the order process.
              </p>

            </details>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                Will you confirm my photo before printing?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Yes. Your photograph and order details are confirmed before
                production.
              </p>

            </details>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                What colour is the lithophane?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                The lithophane panel is white. You can choose the outer frame
                colour between Black and Grey.
              </p>

            </details>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                Can I order more than one?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Yes. Select the quantity you need. When you purchase 2 or more
                lamps, the 10% quantity discount is applied automatically.
              </p>

            </details>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                Is delivery really free across India?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Yes. The current catalog offer includes free delivery across
                India.
              </p>

            </details>

            <details className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <summary className="cursor-pointer list-none pr-8 text-base font-bold">
                How long does delivery take?
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                The current estimate shown on the product page is 2–4 days
                after dispatch. Actual transit time can vary by location.
              </p>

            </details>

          </div>

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10 bg-[#050505] py-20">

        <div className="mx-auto max-w-3xl px-5 text-center">

          <p className="text-xs font-bold tracking-[0.3em] text-cyan-400">
            CREATE YOURS
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Your memory.
            <br />
            Your lamp.
          </h2>

          <p className="mx-auto mt-6 max-w-xl leading-7 text-gray-400">
            Send us your favourite photograph and let RMX Nexus turn it into a
            personalized illuminated 3D keepsake.
          </p>

          <button
            type="button"
            onClick={
              goToCheckout
            }
            className="mt-8 inline-flex rounded-full bg-white px-8 py-4 font-black text-black transition hover:scale-[1.02] hover:bg-cyan-400"
          >
            BUY NOW →
          </button>

          <p className="mt-5 text-xs text-gray-600">
            *Delivery estimate depends on destination and courier conditions.
          </p>

        </div>

      </section>

      {/* MOBILE CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 p-3 backdrop-blur-xl md:hidden">

        <button
          type="button"
          onClick={
            goToCheckout
          }
          className="flex w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-black text-black"
        >
          BUY NOW • ₹
          {total.toLocaleString(
            "en-IN"
          )}{" "}
          • Free Delivery →
        </button>

      </div>

    </main>
  );
}