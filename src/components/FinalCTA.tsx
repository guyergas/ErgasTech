export default function FinalCTA() {
  return (
    <section id="contact" className="relative py-10 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto text-center section-appear">
        <h2 className="text-3xl font-bold mb-4">
          Let's make your business simpler, faster, and more effective.
        </h2>

        <p className="text-white/70 text-sm mb-6">
          A short conversation about where you're stuck and what's worth fixing.
        </p>

        <a
          href="mailto:guyergas@gmail.com?subject=Book%20a%20Call&body=Hi%20Guy,%0A%0AI'd%20like%20to%20schedule%20a%20call.%0A%0ABusiness:%0AChallenge:%0A%0AThanks"
          className="btn-primary inline-block"
        >
          Book a Call
        </a>
      </div>
    </section>
  );
}
