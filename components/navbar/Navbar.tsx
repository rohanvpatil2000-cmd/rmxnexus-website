"use client";

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto mt-6 flex w-[92%] max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-xl">

        <h1 className="text-xl font-bold tracking-[0.3em] text-white">
          RMX NEXUS
        </h1>

        <nav className="hidden gap-8 text-sm text-gray-300 md:flex">
          <a href="#" className="transition hover:text-white">
            Home
          </a>

          <a href="#" className="transition hover:text-white">
            Products
          </a>

          <a href="#" className="transition hover:text-white">
            Services
          </a>

          <a href="#" className="transition hover:text-white">
            About
          </a>

          <a href="#" className="transition hover:text-white">
            Contact
          </a>
        </nav>

        <button className="rounded-full bg-white px-6 py-2 font-semibold text-black transition hover:scale-105">
          Get Quote
        </button>

      </div>
    </motion.header>
  );
}