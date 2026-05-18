export default function FounderIntro() {
  return (
    <section id="what-i-bring" className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-12">Background & What I Bring</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Background */}
          <div>
            <h3 className="text-lg font-bold text-cyan mb-4">Deep Experience</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              15+ years building complex systems in deep-tech environments (Intel, NVIDIA / Mellanox, NextSilicon).
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              Applied that experience to help businesses operate with clarity, efficiency, and scalable systems.
            </p>
          </div>

          {/* What I Bring */}
          <div>
            <h3 className="text-lg font-bold text-cyan mb-4">My Approach</h3>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex gap-3">
                <span className="text-cyan font-bold">✓</span>
                <span>Deep systems thinking from complex environments</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan font-bold">✓</span>
                <span>15+ years on performance, infrastructure, scale</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan font-bold">✓</span>
                <span>Turn complexity into simple, structured solutions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
