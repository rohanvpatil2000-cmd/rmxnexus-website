import Hero from "@/components/hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import FeaturedProducts from "@/components/sections/FeaturedProducts";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Services />
      <FeaturedProducts />
    </>
  );
}