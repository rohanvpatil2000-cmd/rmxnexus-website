"use client";

import { motion } from "framer-motion";

const links = [
  { name: "Home", href: "#" },
  { name: "Products", href: "#products" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

const whatsappUrl =
  "https://wa.me/919021971507?text=Hi%20RMX%20Nexus%2C%20I%E2%80%99m%20interested%20in%20your%20personalized%20lithophane%20lamps.%20I%E2%80%99d%20like%20to%20know%20more.";

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

        {/* WhatsApp Button */}

        <a
          href={whatsappUrl}
          aria-label="Get a quote from RMX Nexus on WhatsApp"
          className="rounded-full bg-white px-7 py-3 font-semibold !text-black transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          Get Quote
        </a>
      </div>
    </motion.nav>
  );
}