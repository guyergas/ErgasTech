"use client";

import { useEffect, useState } from "react";

interface NavbarProps {
  isScrolled: boolean;
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-secondary/80 backdrop-blur-md border-b border-cyan/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection("home")}>
          <img
            src="/logo.png"
            alt="ErgasTech Logo"
            className="h-20 w-auto group-hover:opacity-80 transition-opacity"
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("what-i-do")}
            className="text-white/70 hover:text-cyan transition-colors text-sm font-medium"
          >
            What I Do
          </button>
          <button
            onClick={() => scrollToSection("how-i-work")}
            className="text-white/70 hover:text-cyan transition-colors text-sm font-medium"
          >
            How I Work
          </button>
          <button
            onClick={() => scrollToSection("what-i-bring")}
            className="text-white/70 hover:text-cyan transition-colors text-sm font-medium"
          >
            What I Bring
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-white/70 hover:text-cyan transition-colors text-sm font-medium"
          >
            Background
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-white/70 hover:text-cyan transition-colors text-sm font-medium"
          >
            Contact
          </button>

          <a href="mailto:guyergas@gmail.com?subject=Book%20a%20Call&body=Hi%20Guy,%0A%0AI'd%20like%20to%20schedule%20a%20call.%0A%0ABusiness:%0AChallenge:%0A%0AThanks" className="btn-primary">
            Book a Call
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 w-6 h-6 justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? "opacity-0" : ""}`} />
          <div className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-dark-secondary/95 backdrop-blur-md border-b border-cyan/10 px-6 py-4 animate-fade-in">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("what-i-do")}
              className="text-white/70 hover:text-cyan transition-colors text-sm font-medium text-left"
            >
              What I Do
            </button>
            <button
              onClick={() => scrollToSection("how-i-work")}
              className="text-white/70 hover:text-cyan transition-colors text-sm font-medium text-left"
            >
              How I Work
            </button>
            <button
              onClick={() => scrollToSection("what-i-bring")}
              className="text-white/70 hover:text-cyan transition-colors text-sm font-medium text-left"
            >
              What I Bring
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-white/70 hover:text-cyan transition-colors text-sm font-medium text-left"
            >
              Background
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-white/70 hover:text-cyan transition-colors text-sm font-medium text-left"
            >
              Contact
            </button>
            <a href="mailto:guyergas@gmail.com?subject=Book%20a%20Call&body=Hi%20Guy,%0A%0AI'd%20like%20to%20schedule%20a%20call.%0A%0ABusiness:%0AChallenge:%0A%0AThanks" className="btn-primary w-full block text-center">
              Book a Call
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
