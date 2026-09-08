"use client";

const whatsappUrl =
  "https://wa.me/919021971507?text=Hi%20RMX%20Nexus%2C%20I%E2%80%99m%20interested%20in%20your%20personalized%20lithophane%20lamps.%20I%E2%80%99d%20like%20to%20know%20more.";

export default function WhatsAppButton() {
  const openWhatsApp = () => {
    window.location.href = whatsappUrl;
  };

  return (
    <button
      type="button"
      onClick={openWhatsApp}
      aria-label="Chat with RMX Nexus on WhatsApp"
      className="fixed bottom-5 right-5 z-[100] flex cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-[#25D366] px-4 py-3 text-black shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.87 11.87 0 0 0 12.04 0C5.5 0 .18 5.32.18 11.86c0 2.09.55 4.13 1.6 5.92L.08 24l6.36-1.67a11.83 11.83 0 0 0 5.6 1.42h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.24-6.15-3.39-8.41ZM12.05 21.72h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.77.99 1.01-3.67-.23-.38a9.83 9.83 0 0 1-1.51-5.22C2.16 6.44 6.6 2 12.04 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.44-4.43 9.83-9.87 9.83Zm5.41-7.37c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>

      <span className="text-sm font-bold text-black sm:inline">
        Chat with us
      </span>
    </button>
  );
}