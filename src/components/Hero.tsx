export default function Hero() {
  return (
    <section id="home" className="min-h-[75vh] flex items-center justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan/10 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-dark/10 rounded-full blur-3xl opacity-25 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-cyan/5 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="space-y-6 section-appear">
          {/* Problem statement */}
          <div className="space-y-3">
            <p className="text-base md:text-lg text-cyan font-medium uppercase tracking-wide">
              ✦ The Reality
            </p>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              If it feels like the world is moving forward and your business is not keeping up—
            </p>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed">
              or you've adopted tools but things still feel inefficient or messy—
            </p>
            <p className="text-white/60">
              you're not alone.
            </p>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Tech Strategy &<br className="hidden sm:block" /> <span className="text-cyan">Systems Upgrade</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
            I help businesses make sense of technology, reduce wasted effort, and build systems that actually work.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <a
              href="mailto:guyergas@gmail.com?subject=Book%20a%20Call&body=Hi%20Guy,%0A%0AI'd%20like%20to%20schedule%20a%20call.%0A%0ABusiness:%0AChallenge:%0A%0AThanks"
              className="btn-primary inline-block hover:shadow-lg hover:shadow-cyan/20 transition-all"
            >
              Book a Free Consultation
            </a>
          </div>

          {/* Subtext CTA */}
          <p className="text-white/50 text-sm pt-2">
            15+ years of deep-tech experience. Practical solutions for real problems.
          </p>
        </div>
      </div>
    </section>
  );
}
