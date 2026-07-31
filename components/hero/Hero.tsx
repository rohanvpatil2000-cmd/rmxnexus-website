"use client";

import { motion } from "framer-motion";
import Navbar from "../navbar/Navbar";
import Background from "../background/Background";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">

      <Background />

      <Navbar />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 text-center">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-sm tracking-[0.35em] text-cyan-300"
        >
          PREMIUM 3D PRINTING STUDIO
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl text-6xl font-black leading-none md:text-8xl xl:text-9xl"
        >
          RMX
          <br />
          NEXUS
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 max-w-4xl text-2xl font-semibold text-gray-100 md:text-4xl"
        >
          Precision Manufacturing
          <br />
          For The Next Generation
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-3xl text-lg leading-8 text-gray-400 md:text-xl"
        >
          Premium 3D Printing • Rapid Prototyping • Product Design •
          Custom Manufacturing • Business Branding
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-14 flex flex-col gap-5 sm:flex-row"
        >
          <button className="rounded-full bg-white px-10 py-5 text-lg font-bold text-black transition hover:scale-105">
            Get Instant Quote
          </button>

          <button className="rounded-full border border-white/20 bg-white/5 px-10 py-5 text-lg font-semibold backdrop-blur-xl transition hover:border-cyan-400 hover:bg-cyan-500/10">
            Explore Products
          </button>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
          }}
          className="mt-24 flex flex-col items-center text-gray-400"
        >
          <span className="mb-3 text-sm tracking-[0.3em] uppercase">
            Scroll
          </span>

          <div className="flex h-16 w-9 justify-center rounded-full border border-white/20">
            <div className="mt-2 h-4 w-2 rounded-full bg-cyan-400"></div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}