"use client";

import { motion } from "framer-motion";

const portfolio = [
  {
    title: "House Nameplates",
    category: "Home",
  },
  {
    title: "Lithophanes",
    category: "Photo Art",
  },
  {
    title: "Rapid Prototypes",
    category: "Engineering",
  },
  {
    title: "Business Logos",
    category: "Branding",
  },
  {
    title: "Wall Decor",
    category: "Interior",
  },
  {
    title: "Custom Gifts",
    category: "Personalized",
  },
];

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="bg-black py-32 text-white"
    >
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="mb-16 text-center"
        >

          <p className="uppercase tracking-[0.35em] text-cyan-400 text-sm">
            PORTFOLIO
          </p>

          <h2 className="mt-4 text-5xl font-black">
            Our Recent Work
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Every project is crafted with precision, creativity and
            premium finishing.
          </p>

        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {portfolio.map((item, index) => (

            <motion.div

              key={item.title}

              initial={{ opacity: 0, y: 40 }}

              whileInView={{ opacity: 1, y: 0 }}

              viewport={{ once: true }}

              transition={{
                delay: index * .08,
              }}

              whileHover={{
                y: -10,
                scale: 1.02,
              }}

              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >

              <div className="flex h-72 items-center justify-center bg-gradient-to-br from-cyan-500/20 via-black to-blue-500/20">

                <span className="text-lg text-gray-400">
                  Image Placeholder
                </span>

              </div>

              <div className="p-8">

                <p className="mb-2 text-sm uppercase tracking-widest text-cyan-400">
                  {item.category}
                </p>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <button className="mt-6 rounded-full border border-white/20 px-6 py-3 transition hover:bg-cyan-500 hover:text-black">
                  View Project
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}