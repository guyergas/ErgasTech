"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhatIDo from "@/components/WhatIDo";
import FounderIntro from "@/components/FounderIntro";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="bg-dark">
      <Navbar isScrolled={isScrolled} />
      <Hero />
      <WhatIDo />
      <Problem />
      <Solution />
      <FounderIntro />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <FinalCTA />
      <Footer />
    </main>
  );
}
