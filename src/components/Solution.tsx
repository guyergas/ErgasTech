export default function Solution() {
  const steps = [
    {
      number: 1,
      title: "Understand",
      description: "Deep dive into how you actually work. Identify waste, friction, and bottlenecks.",
      icon: "📊"
    },
    {
      number: 2,
      title: "Identify",
      description: "Find the leverage points. Where can structure create the biggest impact?",
      icon: "🎯"
    },
    {
      number: 3,
      title: "Design",
      description: "Build a clear, simple system. Everyone knows their role and what's expected.",
      icon: "✏️"
    },
    {
      number: 4,
      title: "Implement",
      description: "Set it up. Train your team. Hand it off. You run it on your own.",
      icon: "🚀"
    }
  ];

  return (
    <section id="how-i-work" className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-3">How I Work</h2>
        <p className="text-white/60 text-sm mb-10">A structured, practical approach to systems transformation:</p>

        <div className="grid md:grid-cols-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-cyan/30 transition-all group hover:bg-gradient-to-br hover:from-white/8 hover:to-cyan/5"
            >
              <div className="flex gap-4 items-start mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-cyan-dark flex items-center justify-center font-bold text-dark text-sm group-hover:shadow-lg group-hover:shadow-cyan/30 transition-all">
                    {step.number}
                  </div>
                </div>
                <div className="text-2xl">{step.icon}</div>
              </div>
              <h3 className="font-bold text-white mb-2 text-base group-hover:text-cyan transition-colors">
                {step.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Visual flow indicator */}
        <div className="mt-10 text-center text-white/50 text-sm">
          <p>Each step builds on the previous one, creating sustainable change.</p>
        </div>
      </div>
    </section>
  );
}
