import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LogoTicker } from "@/components/LogoTicker";
import { BentoGrid } from "@/components/BentoGrid";
import { TechShowcase } from "@/components/TechShowcase";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LogoTicker />
      <BentoGrid />
      <TechShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
