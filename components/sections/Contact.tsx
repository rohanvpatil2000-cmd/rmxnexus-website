"use client";

import { motion } from "framer-motion";

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-[#050505] py-32 text-white"
    >
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mb-20 text-center"
        >

          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">
            CONTACT RMX NEXUS
          </p>

          <h2 className="mt-4 text-5xl font-black">
            Let's Build Something Amazing
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-400">
            Whether you need custom 3D printing, rapid prototyping,
            engineering components or personalized products,
            we're ready to bring your ideas to life.
          </p>

        </motion.div>

        <div className="grid gap-16 lg:grid-cols-2">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
          >

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

              <h3 className="mb-8 text-3xl font-bold">
                Get a Quote
              </h3>

              <div className="space-y-6">

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 outline-none"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 outline-none"
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 outline-none"
                />

                <textarea
                  rows={6}
                  placeholder="Tell us about your project..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-4 outline-none"
                />

                <button className="w-full rounded-xl bg-cyan-500 py-4 text-lg font-bold text-black transition hover:bg-cyan-400">
                  Request Quote
                </button>

              </div>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
          >

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-10 backdrop-blur-xl">

              <h3 className="mb-8 text-3xl font-bold">
                Why Work With RMX Nexus?
              </h3>

              <div className="space-y-6 text-lg text-gray-300">

                <p>✅ Premium Quality 3D Printing</p>

                <p>✅ Rapid Prototyping</p>

                <p>✅ Engineering Components</p>

                <p>✅ Personalized Gifts</p>

                <p>✅ House Nameplates</p>

                <p>✅ Business Branding Products</p>

                <p>✅ Fast Turnaround</p>

                <p>✅ Dedicated Customer Support</p>

              </div>

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}