"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      <motion.div
        animate={{
          x: [0, 150, -150, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[140px]"
      />

      <motion.div
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 100, -100, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-400/20 blur-[140px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[180px]"
      />

    </div>
  );
}