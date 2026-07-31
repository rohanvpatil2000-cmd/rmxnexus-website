import IntroAnimation from "@/components/intro/IntroAnimation";
import Hero from "@/components/hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Services from "@/components/sections/Services";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import About from "@/components/sections/About";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Portfolio from "@/components/sections/Portfolio";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <IntroAnimation />
      <Hero />
      <HowItWorks />
      <Services />
      <FeaturedProducts />
      <About />
      <WhyChooseUs />
      <Portfolio />
      <Contact />
    </>
  );
}