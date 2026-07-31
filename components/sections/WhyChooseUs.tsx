"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Precision Printing",
    description:
      "Professional FDM printing with exceptional dimensional accuracy.",
    icon: "🎯",
  },
  {
    title: "Fast Delivery",
    description:
      "Rapid turnaround for prototypes and production parts.",
    icon: "⚡",
  },
  {
    title: "Premium Quality",
    description:
      "Every product is inspected before delivery.",
    icon: "⭐",
  },
  {
    title: "Custom Designs",
    description:
      "We create products tailored to your exact requirements.",
    icon: "🎨",
  },
  {
    title: "Affordable Pricing",
    description:
      "Premium manufacturing without premium prices.",
    icon: "💎",
  },
  {
    title: "Dedicated Support",
    description:
      "Quick responses and expert guidance throughout your project.",
    icon: "🤝",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-black py-28 text-white">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="text-center mb-16"
        >
          <p className="uppercase tracking-[0.35em] text-cyan-400 text-sm">
            WHY CHOOSE US
          </p>

          <h2 className="mt-4 text-5xl font-black">
            Built For Quality.
            <br />
            Trusted For Precision.
          </h2>

          <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
            Every product is manufactured with accuracy,
            premium materials and attention to detail.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((item, index) => (

            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all"
            >

              <div className="text-5xl">
                {item.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                {item.description}
              </p>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}