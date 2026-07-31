"use client";

import { motion } from "framer-motion";

const products = [
  {
    title: "Custom Nameplates",
    description: "Premium 3D printed house nameplates with modern finishes.",
  },
  {
    title: "Lithophanes",
    description: "Transform your memories into illuminated 3D photo art.",
  },
  {
    title: "Home Decor",
    description: "Elegant décor pieces designed for modern interiors.",
  },
  {
    title: "Rapid Prototypes",
    description: "Engineering prototypes with professional precision.",
  },
  {
    title: "Business Branding",
    description: "Office logos, display models and promotional products.",
  },
  {
    title: "Custom Gifts",
    description: "Personalized gifts made with premium materials.",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-black py-32 text-white">
      <div className="mx-auto max-w-7xl px-8">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-4 text-center text-5xl font-black"
        >
          FEATURED PRODUCTS
        </motion.h2>

        <p className="mb-20 text-center text-gray-400">
          Crafted with Precision. Designed for Excellence.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {products.map((item) => (

            <motion.div
              key={item.title}
              whileHover={{
                y: -12,
                scale: 1.02,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >

              <div className="h-56 bg-gradient-to-br from-cyan-500/20 via-black to-blue-900/20"></div>

              <div className="p-8">

                <h3 className="mb-4 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="leading-8 text-gray-400">
                  {item.description}
                </p>

                <button className="mt-8 rounded-full border border-white/20 px-6 py-3 transition hover:bg-white hover:text-black">
                  Learn More
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}