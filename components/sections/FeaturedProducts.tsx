"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Gift,
  Truck,
  Zap,
  ShieldCheck,
  Percent,
} from "lucide-react";

type SizeOption = {
  id: string;
  name: string;
  dimensions: string;
  price: number;
  popular?: boolean;
};

const sizes: SizeOption[] = [
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
    popular: true,
  },
  {
    id: "large",
    name: "Large",
    dimensions: "20 × 20 cm",
    price: 1399,
  },
  {
    id: "xl",
    name: "XL",
    dimensions: "25 × 25 cm",
    price: 1899,
  },
];

const lithophaneColors = [
  {
    id: "natural-white",
    name: "Natural White",
    description: "Neutral white • maximum detail",
    hex: "#ffffff",
  },
  {
    id: "warm-white",
    name: "Warm White",
    description: "Warm white • cozy glow",
    hex: "#fff1cf",
  },
];

const frameColors = [
  {
    id: "black",
    name: "Matte Black",
    hex: "#111111",
  },
  {
    id: "grey",
    name: "Graphite Grey",
    hex: "#55585c",
  },
];

const imageNames = [
  {
    file: "01-hero.jpg",
    alt: "RMX Nexus personalized lithophane lamp",
  },
  {
    file: "02-daylight.jpg",
    alt: "Personalized lithophane lamp in daylight",
  },
  {
    file: "03-illuminated.jpg",
    alt: "Illuminated personalized lithophane lamp",
  },
  {
    file: "04-size-reference.jpg",
    alt: "Lithophane lamp size reference",
  },
];

export default function FeaturedProducts() {
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState("standard");

  const [selectedLithophaneColor, setSelectedLithophaneColor] =
    useState("natural-white");

  const [selectedFrame, setSelectedFrame] = useState("black");

  const [quantity, setQuantity] = useState(1);

  const [discountApplied, setDiscountApplied] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  const size =
    sizes.find((item) => item.id === selectedSize) ?? sizes[1];

  const lithophaneColor =
    lithophaneColors.find(
      (item) => item.id === selectedLithophaneColor
    ) ?? lithophaneColors[0];

  const frameColor =
    frameColors.find((item) => item.id === selectedFrame) ??
    frameColors[0];

  /*
   * IMPORTANT:
   * The folder name exactly matches the folders created
   * inside public/images/lithophane.
   *
   * Example:
   * mini-black-natural-white
   * standard-grey-warm-white
   * xl-black-warm-white
   */
  const imageFolder = `${selectedSize}-${selectedFrame}-${selectedLithophaneColor}`;

  /*
   * Build the gallery automatically from the selected configuration.
   */
  const gallery = useMemo(() => {
    return imageNames.map((image) => ({
      src: `/images/lithophane/${imageFolder}/${image.file}`,
      alt: image.alt,
    }));
  }, [imageFolder]);

  const subtotal = size.price * quantity;

  const eligibleForDiscount = quantity >= 2;

  const discount = useMemo(() => {
    if (!discountApplied || !eligibleForDiscount) {
      return 0;
    }

    return Math.round(subtotal * 0.1);
  }, [discountApplied, eligibleForDiscount, subtotal]);

  const total = subtotal - discount;

  const applyDiscount = () => {
    if (eligibleForDiscount) {
      setDiscountApplied(true);
    }
  };

  const changeQuantity = (value: number) => {
    const nextQuantity = Math.max(1, Math.min(10, value));

    setQuantity(nextQuantity);

    if (nextQuantity < 2) {
      setDiscountApplied(false);
    }
  };

  /*
   * Whenever the customer changes size, frame colour,
   * or lithophane colour, start the gallery again
   * from the hero image.
   */
  const changeConfiguration = (
    type: "size" | "frame" | "lithophane",
    value: string
  ) => {
    setActiveImage(0);

    if (type === "size") {
      setSelectedSize(value);
    }

    if (type === "frame") {
      setSelectedFrame(value);
    }

    if (type === "lithophane") {
      setSelectedLithophaneColor(value);
    }
  };

  return (
    <section
      id="products"
      className="relative overflow-hidden bg-black py-24 text-white md:py-32"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-20 h-[550px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">

        {/* SECTION HEADING */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-semibold tracking-[0.25em] text-cyan-400">
            <Gift size={14} />
            PERSONALIZED GIFT
          </div>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            FEATURED PRODUCT
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Turn your favourite photograph into a beautiful illuminated
            lithophane lamp — made specially for you.
          </p>
        </div>

        {/* MAIN PRODUCT CARD */}
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/40">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">

            {/* IMAGE AREA */}
            <div className="border-b border-white/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">

              {/* Main image */}
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-black">

                <Image
                  src={gallery[activeImage].src}
                  alt={`${gallery[activeImage].alt} — ${size.name}, ${frameColor.name}, ${lithophaneColor.name}`}
                  fill
                  priority={activeImage === 0}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />

                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  Personalized
                </div>

                {/* Current configuration badge */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Preview
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {size.name} • {frameColor.name} •{" "}
                    {lithophaneColor.name}
                  </p>
                </div>
              </div>

              {/* Gallery thumbnails */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`View ${index === 0 ? "hero" : index === 1 ? "daylight" : index === 2 ? "illuminated" : "size reference"} image`}
                    aria-pressed={activeImage === index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
                      activeImage === index
                        ? "border-cyan-400 ring-2 ring-cyan-400/20"
                        : "border-white/10 opacity-70 hover:border-white/30 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>

              {/* Image path debugging removed from production UI */}
            </div>

            {/* PRODUCT DETAILS */}
            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                  BEST SELLER
                </span>

                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-gray-400">
                  Made to Order
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Custom Lithophane Lamp
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Upload your favourite photo and we transform it into a
                detailed 3D-printed lithophane that comes alive when
                illuminated.
              </p>

              {/* PRICE */}
              <div className="mt-7 flex items-end gap-3">
                <span className="text-4xl font-black">
                  ₹{total.toLocaleString("en-IN")}
                </span>

                {discount > 0 && (
                  <span className="pb-1 text-sm text-gray-500 line-through">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {discount > 0 && (
                <p className="mt-2 text-sm font-semibold text-emerald-400">
                  You save ₹{discount.toLocaleString("en-IN")} with the
                  2-piece offer.
                </p>
              )}

              {/* SIZE */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">
                    Choose Size
                  </label>

                  <span className="text-xs text-gray-500">
                    Larger size = larger illuminated photo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        changeConfiguration("size", option.id)
                      }
                      className={`relative rounded-2xl border p-4 text-left transition-all ${
                        selectedSize === option.id
                          ? "border-cyan-400 bg-cyan-400/[0.08]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/25"
                      }`}
                    >
                      {option.popular && (
                        <span className="absolute -right-1 -top-2 rounded-full bg-cyan-400 px-2 py-1 text-[9px] font-black text-black">
                          POPULAR
                        </span>
                      )}

                      <div className="font-bold">
                        {option.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {option.dimensions}
                      </div>

                      <div className="mt-3 text-sm font-bold">
                        ₹{option.price.toLocaleString("en-IN")}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* LITHOPHANE COLOUR */}
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold">
                    Lithophane Colour
                  </label>

                  <span className="text-xs text-gray-500">
                    No extra charge
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {lithophaneColors.map((color) => {
                    const selected =
                      selectedLithophaneColor === color.id;

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() =>
                          changeConfiguration(
                            "lithophane",
                            color.id
                          )
                        }
                        className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? "border-cyan-400 bg-cyan-400/[0.08]"
                            : "border-white/10 bg-white/[0.02] hover:border-white/25"
                        }`}
                      >
                        <span
                          className="h-9 w-9 shrink-0 rounded-full border border-gray-300 shadow-inner"
                          style={{
                            backgroundColor: color.hex,
                          }}
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-semibold">
                            {color.name}
                          </p>

                          <p className="mt-1 text-[11px] text-gray-500">
                            {color.description}
                          </p>
                        </div>

                        {selected && (
                          <Check
                            className="ml-auto shrink-0 text-cyan-400"
                            size={18}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Choose the filament shade for your lithophane.
                  Both options are designed to let light pass
                  through the image clearly.
                </p>
              </div>

              {/* FRAME COLOUR */}
              <div className="mt-7">
                <label className="mb-3 block text-sm font-semibold">
                  Frame Colour
                </label>

                <div className="flex gap-3">
                  {frameColors.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() =>
                        changeConfiguration("frame", frame.id)
                      }
                      className={`flex flex-1 items-center gap-3 rounded-2xl border p-3 transition-all ${
                        selectedFrame === frame.id
                          ? "border-cyan-400 bg-cyan-400/[0.07]"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <span
                        className="h-8 w-8 rounded-full border border-white/20"
                        style={{
                          backgroundColor: frame.hex,
                        }}
                      />

                      <span className="text-sm font-medium">
                        {frame.name}
                      </span>

                      {selectedFrame === frame.id && (
                        <Check
                          className="ml-auto text-cyan-400"
                          size={17}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Frame colour is independent from the lithophane
                  colour.
                </p>
              </div>

              {/* CURRENT SELECTION */}
              <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                <p className="text-xs font-semibold tracking-wider text-gray-500">
                  YOUR SELECTION
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    {size.name} • {size.dimensions}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    {lithophaneColor.name}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    {frameColor.name}
                  </span>
                </div>

                <p className="mt-3 text-[10px] text-gray-600">
                  Your selected finish is shown in the preview above.
                </p>
              </div>

              {/* QUANTITY */}
              <div className="mt-7">
                <label className="mb-3 block text-sm font-semibold">
                  Quantity
                </label>

                <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.02] p-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(quantity - 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-gray-300 hover:bg-white/10"
                  >
                    −
                  </button>

                  <span className="w-14 text-center font-bold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(quantity + 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-gray-300 hover:bg-white/10"
                  >
                    +
                  </button>

                  <span className="ml-auto mr-3 text-xs text-gray-500">
                    {quantity === 1
                      ? "Add one more for 10% OFF"
                      : "2+ pieces qualify"}
                  </span>
                </div>
              </div>

              {/* OFFER */}
              <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <Percent
                    className="mt-0.5 shrink-0 text-amber-400"
                    size={20}
                  />

                  <div className="flex-1">
                    <p className="font-bold text-amber-300">
                      BUY 2 & GET 10% OFF
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Add at least 2 lithophane lamps to unlock
                      your discount.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={applyDiscount}
                    disabled={!eligibleForDiscount}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      eligibleForDiscount
                        ? discountApplied
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-amber-400 text-black hover:bg-amber-300"
                        : "cursor-not-allowed bg-white/5 text-gray-600"
                    }`}
                  >
                    {discountApplied
                      ? "Applied ✓"
                      : "Apply 10%"}
                  </button>
                </div>
              </div>

              {/* BENEFITS */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <Truck
                    className="mb-2 text-cyan-400"
                    size={20}
                  />

                  <p className="text-sm font-bold">
                    FREE DELIVERY
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    All India
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <Zap
                    className="mb-2 text-cyan-400"
                    size={20}
                  />

                  <p className="text-sm font-bold">
                    FAST SHIPPING
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Estimated 2–4 days
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck
                  size={15}
                  className="text-emerald-400"
                />

                Carefully packed before dispatch
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams({
                    size: selectedSize,
                    frame: selectedFrame,
                    lithophane: selectedLithophaneColor,
                    quantity: String(quantity),
                  });

                  router.push(`/checkout?${params.toString()}`);
                }}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition-all hover:bg-cyan-300"
              >
                BUY NOW

                <ChevronDown
                  className="rotate-[-90deg]"
                  size={18}
                />
              </button>

              <p className="mt-3 text-center text-xs text-gray-600">
                Photo upload and final order details will be
                collected at checkout.
              </p>
            </div>
          </div>
        </div>

        {/* RAKSHA BANDHAN PROMOTIONAL STRIP */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.08] via-white/[0.03] to-cyan-400/[0.08]">
          <div className="flex flex-col items-center gap-4 px-6 py-6 text-center md:flex-row md:justify-between md:text-left">

            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-cyan-400">
                RAKSHA BANDHAN SPECIAL
              </p>

              <h3 className="mt-2 text-xl font-black sm:text-2xl">
                A photo that becomes a keepsake.
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Order early for the best chance of receiving your
                personalized gift on time.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 px-5 py-3">
              <p className="text-xs text-gray-500">
                DELIVERY
              </p>

              <p className="mt-1 font-bold">
                Estimated 2–4 days
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}