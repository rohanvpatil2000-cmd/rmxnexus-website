"use client";

import { motion } from "framer-motion";
import {
  Printer,
  Box,
  Palette,
  Settings2,
  Layers3,
  Lightbulb,
} from "lucide-react";

const services = [
  {
    icon: Printer,
    title: "3D Printing",
    description:
      "High-quality custom 3D printing for prototypes, functional parts, gifts and everyday products.",
  },
  {
    icon: Box,
    title: "Custom Products",
    description:
      "Turn your idea into a physical product with dimensions, shape and details tailored to your requirements.",
  },
  {
    icon: Palette,
    title: "Personalized Gifts",
    description:
      "Custom nameplates, lithophane lamps, photo products and meaningful gifts made especially for you.",
  },
  {
    icon: Settings2,
    title: "Rapid Prototyping",
    description:
      "Quickly test form, fit and design concepts before moving toward a final manufactured product.",
  },
  {
    icon: Layers3,
    title: "Product Modification",
    description:
      "Modify existing designs, improve dimensions or adapt models for your specific application.",
  },
  {
    icon: Lightbulb,
    title: "Idea to Product",
    description:
      "Have an idea but no model? We help transform the concept into a printable and practical product.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-black py-28 text-white md:py-36"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="mb-5 text-xs font-semibold tracking-[0.35em] text-cyan-400">
            WHAT WE DO
          </p>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            OUR SERVICES
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            From a simple custom gift to a functional prototype, RMX Nexus
            brings ideas into the physical world through precision 3D
            manufacturing.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -7 }}
                className="group rounded-3xl border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.06]"
              >
                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/15">
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                <h3 className="text-xl font-bold tracking-tight">
                  {service.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-gray-400">
                  {service.description}
                </p>

                <div className="mt-7 h-px w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}