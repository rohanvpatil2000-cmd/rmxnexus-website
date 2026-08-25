import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

function CheckoutLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10 text-white">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

        <p className="mt-5 text-sm font-semibold text-gray-400">
          Loading checkout...
        </p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}