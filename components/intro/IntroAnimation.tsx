"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Hero from "../hero/Hero";

export default function IntroAnimation() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-7xl font-extrabold tracking-widest text-white"
              >
                RMX
                <br />
                NEXUS
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 tracking-[8px] text-gray-400"
              >
                PRECISION • DESIGN • INNOVATION
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showIntro && <Hero />}
    </>
  );
}