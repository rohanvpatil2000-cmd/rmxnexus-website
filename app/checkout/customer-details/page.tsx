"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  MapPin,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

type CheckoutConfig = {
  sizeId: string;
  frameId: string;
  lithophaneId: string;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  selectionText: string;
};

export default function CustomerDetailsPage() {
  const [photo, setPhoto] = useState("");
  const [config, setConfig] = useState<CheckoutConfig | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    try {
      // Use the current checkout photo key first.
      // Keep the older keys as fallbacks so existing sessions still work.
      const savedPhoto =
        localStorage.getItem("rmx_checkout_photo") ||
        localStorage.getItem("rmx_lithophane_photo") ||
        localStorage.getItem("lithophanePhoto") ||
        localStorage.getItem("uploadedPhoto") ||
        "";

      if (savedPhoto) {
        setPhoto(savedPhoto);

        // Normalize the photo into the canonical key.
        localStorage.setItem("rmx_checkout_photo", savedPhoto);
      }

      const savedConfig = localStorage.getItem("rmx_checkout_config");

      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch {
          setConfig(null);
        }
      }
    } catch (storageError) {
      console.error(
        "Unable to load checkout information:",
        storageError
      );
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please enter your complete delivery address."
      );
      return;
    }

    if (!city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    const customerDetails = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };

    try {
      localStorage.setItem(
        "rmx_customer_details",
        JSON.stringify(customerDetails)
      );

      // Make absolutely sure the photo survives into Review.
      if (photo) {
        localStorage.setItem(
          "rmx_checkout_photo",
          photo
        );

        // Also keep the legacy key synchronized.
        localStorage.setItem(
          "rmx_lithophane_photo",
          photo
        );
      }
    } catch (storageError) {
      console.error(
        "Unable to save checkout information:",
        storageError
      );
    }

    window.location.href = "/checkout/review";
  };

  const total = config?.total ?? 0;

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8 md:py-16">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to photo
        </button>

        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-400">
            <User size={14} />
            CUSTOMER DETAILS
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Where should we deliver your lamp?
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Enter your delivery details so we can prepare your personalized
            RMX Nexus order.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <User size={18} className="text-cyan-400" />
                  <h2 className="text-xl font-bold">
                    Contact information
                  </h2>
                </div>

                <p className="text-sm text-gray-500">
                  We'll use these details to contact you about your order.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Full name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Mobile number
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) =>
                      setMobile(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email address
                    <span className="ml-2 text-xs font-normal text-gray-600">
                      Optional
                    </span>
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                  />
                </div>
              </div>

              <div className="my-8 border-t border-white/10" />

              <div className="mb-8">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin size={18} className="text-cyan-400" />
                  <h2 className="text-xl font-bold">
                    Delivery address
                  </h2>
                </div>

                <p className="text-sm text-gray-500">
                  Please provide the address where you want the lamp delivered.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Complete address
                  </label>

                  <textarea
                    rows={4}
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="House / Flat / Building, Street, Area"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      City
                    </label>

                    <input
                      type="text"
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                      placeholder="City"
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      State
                    </label>

                    <input
                      type="text"
                      value={state}
                      onChange={(event) =>
                        setState(event.target.value)
                      }
                      placeholder="State"
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      PIN code
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(event) =>
                        setPincode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
                      }
                      placeholder="6-digit PIN code"
                      className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400/50"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-black transition hover:bg-cyan-300"
              >
                CONTINUE TO ORDER REVIEW
              </button>

              <p className="mt-4 text-center text-xs text-gray-600">
                Your information is used only for processing your order.
              </p>
            </form>
          </section>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7 lg:sticky lg:top-8">
            <h2 className="text-xl font-bold">
              Order summary
            </h2>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <div className="aspect-square">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt="Your uploaded lithophane photo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-600">
                    Photo preview unavailable
                  </div>
                )}
              </div>
            </div>

            {config && (
              <>
                <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                  <p className="text-xs font-semibold tracking-widest text-gray-500">
                    YOUR SELECTION
                  </p>

                  <p className="mt-3 font-bold">
                    {config.selectionText}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Quantity: {config.quantity}
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>
                      ₹{config.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {config.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>10% discount</span>
                      <span>
                        -₹{config.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 text-xl font-black">
                    <span>Total</span>
                    <span>
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <ShieldCheck
                  size={20}
                  className="text-emerald-400"
                />

                <div>
                  <p className="text-sm font-bold">
                    Secure order
                  </p>
                  <p className="text-xs text-gray-500">
                    Your details stay private.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <Truck
                  size={20}
                  className="text-cyan-400"
                />

                <div>
                  <p className="text-sm font-bold">
                    Fast shipping
                  </p>
                  <p className="text-xs text-gray-500">
                    Estimated 2–4 days.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <Check
                  size={20}
                  className="text-cyan-400"
                />

                <div>
                  <p className="text-sm font-bold">
                    Made to order
                  </p>
                  <p className="text-xs text-gray-500">
                    Printed specifically for you.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}