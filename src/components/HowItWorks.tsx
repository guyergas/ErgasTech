export default function HowItWorks() {
  const phases = [
    {
      phase: "Discovery",
      description: "Deep dive into your current systems, workflows, and pain points",
      icon: "📋"
    },
    {
      phase: "Analysis",
      description: "Identify waste, inefficiencies, and opportunities for leverage",
      icon: "🔍"
    },
    {
      phase: "Design",
      description: "Create a clear, simple system tailored to your business",
      icon: "✏️"
    },
    {
      phase: "Implementation",
      description: "Set it up, train your team, and transition to operation",
      icon: "🚀"
    }
  ];

  return (
    <section className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-12">The Engagement Process</h2>

        <div className="relative">
          {/* Timeline connector */}
          <div className="hidden md:block absolute top-20 left-12 right-12 h-0.5 bg-gradient-to-r from-cyan/20 via-cyan/40 to-cyan/20" />

          {/* Phases grid */}
          <div className="grid md:grid-cols-4 gap-6">
            {phases.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute -left-12 top-20 w-8 h-8 rounded-full bg-dark border-2 border-cyan items-center justify-center">
                  <span className="text-cyan text-xs font-bold">{index + 1}</span>
                </div>

                {/* Card */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-cyan/5 to-transparent border border-cyan/20 hover:border-cyan/40 transition-colors group">
                  <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2">{item.phase}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm mb-4">Ready to get started?</p>
          <a href="mailto:guyergas@gmail.com?subject=Let's%20Begin&body=Hi%20Guy,%0A%0AI'm%20interested%20in%20improving%20our%20systems." className="btn-primary">
            Start Your Discovery
          </a>
        </div>
      </div>
    </section>
  );
}
