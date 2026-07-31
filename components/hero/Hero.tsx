"use client";

import { motion } from "framer-motion";
import Navbar from "../navbar/Navbar";
import Background from "../background/Background";
import Services from "../sections/Services";

export default function Hero() {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <Background />

        <Navbar />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center">

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-6xl font-black tracking-wider md:text-8xl"
            >
              RMX NEXUS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400"
            >
              Premium 3D Printing • Rapid Prototyping • Custom Manufacturing
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12 rounded-full bg-white px-10 py-4 text-lg font-semibold text-black transition hover:bg-gray-200"
            >
              Explore Products
            </motion.button>

          </div>
        </div>
      </section>

      <Services />
    </>
  );
}