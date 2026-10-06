"use client";

import { useEffect } from "react";

export default function MetaViewContent() {
  useEffect(() => {
    const sendEvent = () => {
      if (typeof window.fbq === "function") {
        window.fbq("track", "ViewContent", {
          content_name: "Diwali Personalized Lithophane Lamp",
          content_type: "product",
          currency: "INR",
          value: 799,
        });

        console.log("Meta ViewContent event sent.");
        return true;
      }

      return false;
    };

    if (sendEvent()) return;

    const retry1 = window.setTimeout(sendEvent, 500);
    const retry2 = window.setTimeout(sendEvent, 1500);

    return () => {
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
    };
  }, []);

  return null;
}