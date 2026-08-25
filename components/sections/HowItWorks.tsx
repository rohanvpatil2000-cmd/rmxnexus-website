"use client";

import { motion } from "framer-motion";
import {
  ImagePlus,
  WandSparkles,
  Printer,
  PackageCheck,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ImagePlus,
    title: "Share Your Idea",
    description:
      "Send us your photo, design, dimensions or product idea. We turn your requirements into a clear production-ready concept.",
  },
  {
    number: "02",
    icon: WandSparkles,
    title: "We Prepare It",
    description:
      "Our team prepares and optimizes your design for 3D printing, focusing on appearance, dimensions, strength and print quality.",
  },
  {
    number: "03",
    icon: Printer,
    title: "We Print It",
    description:
      "Your product is manufactured using precision 3D printing with carefully selected materials and quality-focused print settings.",
  },
  {
    number: "04",
    icon: PackageCheck,
    title: "Quality Check & Delivery",
    description:
      "Every finished product is inspected, packed securely and prepared for fast delivery to your doorstep.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-black py-28 text-white md:py-36"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <p className="mb-5 text-xs font-semibold tracking-[0.35em] text-cyan-400">
            SIMPLE PROCESS
          </p>

          <h2 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            HOW IT WORKS
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            From your idea to a finished product, we make custom 3D
            manufacturing simple, transparent and hassle-free.
          </p>
        </motion.div>

        {/* STEPS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/[0.07]"
              >
                {/* Number */}
                <div className="absolute right-6 top-5 text-5xl font-black text-white/[0.05]">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="relative mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 transition duration-300 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/15">
                  <Icon size={26} strokeWidth={1.8} />
                </div>

                {/* Step label */}
                <p className="mb-3 text-[10px] font-bold tracking-[0.25em] text-cyan-400">
                  STEP {step.number}
                </p>

                {/* Title */}
                <h3 className="text-2xl font-bold tracking-tight">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-sm leading-7 text-gray-400">
                  {step.description}
                </p>

                {/* Bottom accent */}
                <div className="mt-7 h-px w-0 bg-cyan-400 transition-all duration-500 group-hover:w-full" />
              </motion.article>
            );
          })}
        </div>

        {/* BOTTOM MESSAGE */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-14 text-center"
        >
          <p className="text-sm text-gray-500">
            Have a custom requirement?
          </p>

          <p className="mt-2 text-base font-semibold text-gray-300">
            Tell us what you need. We'll help turn the idea into reality.
          </p>
        </motion.div>
      </div>
    </section>
  );
}