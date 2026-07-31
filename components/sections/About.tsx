"use client";

import { motion } from "framer-motion";

const stats = [
  {
    number: "500+",
    title: "Projects Completed",
  },
  {
    number: "98%",
    title: "Happy Clients",
  },
  {
    number: "24 Hrs",
    title: "Average Response",
  },
  {
    number: "100%",
    title: "Quality Checked",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-black py-28 text-white"
    >
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="grid gap-16 lg:grid-cols-2 items-center"
        >

          {/* Left */}

          <div>

            <p className="mb-3 text-sm uppercase tracking-[0.35em] text-cyan-400">
              ABOUT RMX NEXUS
            </p>

            <h2 className="mb-8 text-5xl font-black leading-tight">
              Precision Manufacturing
              <br />
              Meets Creative Innovation
            </h2>

            <p className="mb-6 text-lg leading-8 text-gray-300">
              RMX Nexus delivers premium 3D printing solutions for
              creators, engineers, startups and businesses.
            </p>

            <p className="mb-6 text-lg leading-8 text-gray-300">
              From custom nameplates and lithophanes to rapid
              prototypes, engineering parts and business branding,
              every product is manufactured with precision and
              attention to detail.
            </p>

            <p className="text-lg leading-8 text-gray-300">
              Our goal is simple:
              Build products that look premium, perform perfectly,
              and exceed customer expectations.
            </p>

          </div>

          {/* Right */}

          <motion.div
            initial={{ opacity: 0, scale: .95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 backdrop-blur-xl"
          >

            <div className="grid grid-cols-2 gap-6">

              {stats.map((item) => (

                <motion.div

                  key={item.title}

                  whileHover={{
                    scale: 1.05,
                    y: -5
                  }}

                  className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all"
                >

                  <h3 className="mb-3 text-5xl font-black text-cyan-400">
                    {item.number}
                  </h3>

                  <p className="text-gray-300">
                    {item.title}
                  </p>

                </motion.div>

              ))}

            </div>

          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}