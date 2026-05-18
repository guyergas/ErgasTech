export default function FinalCTA() {
  return (
    <section id="contact" className="relative py-20 px-6 bg-gradient-to-b from-dark to-dark-secondary border-t border-white/10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-cyan/5 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-3xl mx-auto text-center section-appear relative z-10">
        <div className="space-y-6">
          {/* Eyebrow */}
          <p className="text-cyan text-sm font-medium uppercase tracking-wide">
            Ready to Transform
          </p>

          {/* Main heading */}
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Let's make your business <span className="text-cyan">simpler, faster, and more effective.</span>
          </h2>

          {/* Description */}
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            A short conversation about where you're stuck and what's worth fixing. No sales pitch. Just practical advice.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="mailto:guyergas@gmail.com?subject=Book%20a%20Call&body=Hi%20Guy,%0A%0AI'd%20like%20to%20schedule%20a%20call.%0A%0ABusiness:%0AChallenge:%0A%0AThanks"
              className="btn-primary hover:shadow-lg hover:shadow-cyan/20 transition-all"
            >
              Schedule a Call
            </a>
            <a
              href="mailto:guyergas@gmail.com?subject=Quick%20Question"
              className="px-6 py-3 rounded-lg border border-white/20 text-white hover:border-cyan/40 hover:text-cyan transition-colors font-medium"
            >
              Get in Touch
            </a>
          </div>

          {/* Trust signal */}
          <p className="text-white/50 text-sm pt-4">
            ✓ Fast response • ✓ Practical advice • ✓ No long-term contract required
          </p>
        </div>
      </div>
    </section>
  );
}
