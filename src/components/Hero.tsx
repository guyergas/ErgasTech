export default function Hero() {
  return (
    <section id="home" className="min-h-[70vh] flex items-center justify-center relative overflow-hidden pt-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-dark/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="space-y-3 section-appear">
          <div>
            <p className="text-lg text-cyan/80 mb-3 font-medium">
              If it feels like the world is moving forward and your business is not keeping up—
            </p>
            <p className="text-lg text-white/70 mb-4">
              or you've adopted tools but things still feel inefficient or messy—
            </p>
            <p className="text-white/60 text-base">
              you're not alone.
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Tech Strategy & <span className="text-cyan">Systems Upgrade</span>
          </h1>

          <p className="text-lg text-white/70">
            I help businesses make sense of technology, reduce wasted effort, and build systems that actually work.
          </p>
        </div>
      </div>
    </section>
  );
}
