"use client";

import { motion } from "framer-motion";

export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      <div className="absolute inset-0 bg-black" />

      <motion.div
        animate={{
          x: [0, 120, -120, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[180px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
        }}
        className="absolute left-20 top-40 h-80 w-80 rounded-full bg-blue-500/10 blur-[150px]"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
        }}
        className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-cyan-300/10 blur-[180px]"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_80%)]" />

    </div>
  );
}