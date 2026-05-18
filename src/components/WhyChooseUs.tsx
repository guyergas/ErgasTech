export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Deep Expertise",
      description: "15+ years in deep-tech environments: Intel, NVIDIA, NextSilicon. Real systems at scale.",
      icon: "🏢"
    },
    {
      title: "Practical Focus",
      description: "Not theoretical. We focus on what actually works for your business, not what looks good in slides.",
      icon: "🎯"
    },
    {
      title: "Your Independence",
      description: "We build systems YOU can run. Training included. No dependency on external consultants.",
      icon: "⚙️"
    },
    {
      title: "Clear Communication",
      description: "Complex systems explained simply. Your team understands what's happening and why.",
      icon: "💬"
    }
  ];

  return (
    <section className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-4">Why Work With Me</h2>
        <p className="text-white/60 text-sm mb-12">I bring a different approach to systems consulting.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {reasons.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-cyan/30 transition-all group"
            >
              <div className="flex gap-4 items-start">
                <div className="text-2xl flex-shrink-0 transform group-hover:scale-125 transition-transform">{item.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-2 group-hover:text-cyan transition-colors">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial-style callout */}
        <div className="mt-12 p-6 rounded-lg bg-gradient-to-r from-cyan/10 to-transparent border border-cyan/20">
          <p className="text-white/80 italic text-sm leading-relaxed mb-3">
            "Guy helped us move from chaos to clarity. We went from 'we need to fix our processes' to actually having systems we understand and can maintain."
          </p>
          <p className="text-cyan text-sm font-medium">— Typical client feedback</p>
        </div>
      </div>
    </section>
  );
}
