"use client";

import { motion } from "framer-motion";

const links = [
  { name: "Home", href: "#" },
  { name: "Products", href: "#products" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed left-1/2 top-6 z-50 w-[95%] max-w-7xl -translate-x-1/2"
    >
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-black/60 px-8 py-4 backdrop-blur-2xl">

        {/* Logo */}

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          <h1 className="text-2xl font-black tracking-[0.4em]">
            RMX NEXUS
          </h1>
        </motion.div>

        {/* Desktop Menu */}

        <div className="hidden items-center gap-10 md:flex">

          {links.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileHover={{
                y: -2,
                color: "#22d3ee",
              }}
              className="text-sm font-medium text-gray-300 transition"
            >
              {item.name}
            </motion.a>
          ))}

        </div>

        {/* Button */}

        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="rounded-full bg-white px-7 py-3 font-semibold text-black"
        >
          Get Quote
        </motion.button>

      </div>
    </motion.nav>
  );
}