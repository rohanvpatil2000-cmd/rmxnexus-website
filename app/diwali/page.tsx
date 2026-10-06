import Link from "next/link";

const standardImages = [
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_01.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_02.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_03.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_04.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_05_SCALE_SIDE_BY_SIDE.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_06_SCALE_SIDE_BY_SIDE.jpg",
  "/images/lithophane/standard/RMX_STANDARD_11.2cm_07_DETAIL.jpg",
];

const largeImages = [
  "/images/lithophane/large/RMX_LARGE_16.7cm_01.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_02.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_03.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_04.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_05.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_06.jpg",
  "/images/lithophane/large/RMX_LARGE_16.7cm_07.jpg",
];

export default function DiwaliPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,180,0,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,80,0,0.12),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 sm:pt-12">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-black tracking-[0.2em] text-white"
            >
              RMX NEXUS
            </Link>

            <a
              href="https://wa.me/919021971507?text=Hi%20RMX%20Nexus%2C%20I%20want%20to%20know%20more%20about%20the%20personalized%20lithophane%20lamp."
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white"
            >
              WhatsApp
            </a>
          </div>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                Diwali 2026 Gift
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
                Your favourite photo.
                <span className="block text-amber-300">
                  Turn it into a glowing memory.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                A personalized 3D-printed lithophane lamp made from your own
                photograph. A meaningful Diwali gift for parents, couples,
                family and the people who matter most.
              </p>

              <div className="mt-7 flex flex-wrap items-end gap-x-6 gap-y-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/50">
                    Starting at
                  </div>
                  <div className="text-4xl font-black">₹799</div>
                </div>

                <div className="max-w-xs text-sm leading-6 text-white/60">
                  10% quantity discount on 2–10 lamps.
                  <br />
                  Extra 5% discount on prepaid orders.
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/checkout"
                  className="rounded-2xl bg-white px-7 py-4 text-center text-sm font-black text-black transition hover:bg-amber-300"
                >
                  Create My Lamp
                </Link>

                <a
                  href="#see-it"
                  className="rounded-2xl border border-white/20 px-7 py-4 text-center text-sm font-bold text-white transition hover:bg-white/10"
                >
                  See the Lamp
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/45">
                <span>✓ Made to order</span>
                <span>✓ Upload your own photo</span>
                <span>✓ COD available</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              <img
                src={standardImages[0]}
                alt="RMX Nexus personalized lithophane lamp"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT VISUALS */}
      <section id="see-it" className="border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="max-w-2xl">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              See the difference
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
              It looks different when the light comes on.
            </h2>

            <p className="mt-4 text-base leading-7 text-white/60">
              The photograph is transformed into a physical 3D lithophane.
              Light passing through the panel reveals the image.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {standardImages.slice(0, 4).map((src, index) => (
              <div
                key={src}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <img
                  src={src}
                  alt={`Personalized lithophane lamp view ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY THIS GIFT */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                Not another generic gift
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
                Give them a memory they can keep.
              </h2>

              <p className="mt-5 text-base leading-7 text-white/60">
                Choose a photograph that means something to you. RMX Nexus
                turns that photograph into a personalized illuminated
                keepsake.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Your photograph", "Use a personal photo instead of a generic design."],
                ["3D printed", "Your image becomes a physical lithophane panel."],
                ["Made for gifting", "A personal gift for family, couples and loved ones."],
                ["Order online", "Upload your photo and complete the existing checkout."],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SIZES / PRICE */}
      <section className="border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Choose your size
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              Pick the one that fits your memory.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black">
              <img
                src={standardImages[4]}
                alt="RMX Nexus Standard lithophane lamp"
                className="aspect-[4/3] w-full object-cover"
              />

              <div className="p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">Standard</h3>
                    <p className="mt-1 text-sm text-white/50">
                      11.2 cm lithophane
                    </p>
                  </div>

                  <div className="text-3xl font-black">₹799</div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-black hover:bg-amber-300"
                >
                  Choose Standard
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-amber-300/30 bg-black">
              <img
                src={largeImages[0]}
                alt="RMX Nexus Large lithophane lamp"
                className="aspect-[4/3] w-full object-cover"
              />

              <div className="p-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black">Large</h3>
                    <p className="mt-1 text-sm text-white/50">
                      16.7 cm lithophane
                    </p>
                  </div>

                  <div className="text-3xl font-black">₹1199</div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block rounded-2xl bg-amber-300 px-6 py-4 text-center text-sm font-black text-black hover:bg-amber-200"
                >
                  Choose Large
                </Link>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
            <p className="text-sm leading-6 text-white/65">
              Order 2–10 lamps and get the 10% quantity discount automatically.
              Pay online and receive an additional 5% discount after the
              quantity discount.
            </p>
          </div>
        </div>
      </section>

      {/* LARGE PRODUCT GALLERY */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {largeImages.slice(1, 7).map((src, index) => (
              <div
                key={src}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
              >
                <img
                  src={src}
                  alt={`Large lithophane lamp detail ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6">
          <div className="text-center">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Simple process
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              From photo to glowing gift.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Choose your size",
                "Select Standard or Large and continue to checkout.",
              ],
              [
                "02",
                "Upload your photo",
                "Upload the photograph you want transformed into your lamp.",
              ],
              [
                "03",
                "Place your order",
                "Complete your details and choose prepaid or COD.",
              ],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-3xl border border-white/10 bg-black p-7"
              >
                <div className="text-sm font-black text-amber-300">{number}</div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-6">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
            Diwali 2026
          </div>

          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Make this Diwali personal.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
            Choose a photograph that matters. Turn it into a glowing
            personalized keepsake with RMX Nexus.
          </p>

          <Link
            href="/checkout"
            className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 text-sm font-black text-black transition hover:bg-amber-300"
          >
            Create My Personalized Lamp
          </Link>

          <p className="mt-4 text-xs text-white/40">
            Standard ₹799 • Large ₹1199 • COD available • Prepaid discount available
          </p>
        </div>
      </section>
    </main>
  );
}
