"use client";

import { motion } from "framer-motion";

const services = [
  {
    title: "3D Printing",
    desc: "High-quality FDM and Resin printing with premium finishes.",
  },
  {
    title: "Rapid Prototyping",
    desc: "Turn your ideas into physical prototypes in just days.",
  },
  {
    title: "Product Design",
    desc: "Professional CAD modelling and product development.",
  },
  {
    title: "Custom Manufacturing",
    desc: "Low-volume manufacturing for startups and businesses.",
  },
];

export default function Services() {
  return (
    <section className="bg-black py-32 text-white">
      <div className="mx-auto max-w-7xl px-8">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center text-5xl font-black"
        >
          OUR SERVICES
        </motion.h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {services.map((service) => (
            <motion.div
              key={service.title}
              whileHover={{
                y: -10,
                scale: 1.03,
              }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <h3 className="mb-4 text-2xl font-bold">
                {service.title}
              </h3>

              <p className="leading-8 text-gray-400">
                {service.desc}
              </p>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}