export default function WhatIDo() {
  const services = [
    {
      number: 1,
      title: "For Non-Tech Businesses",
      icon: "🏢",
      description: "Cut through the complexity. You don't need every tool on the market.",
      items: [
        "Understand what technology actually matters for your business",
        "Avoid unnecessary tools and unnecessary complexity",
        "Build simple, clear systems that your team understands and can maintain"
      ]
    },
    {
      number: 2,
      title: "For Tech Companies",
      icon: "⚙️",
      description: "Move faster. Better systems at scale eliminate friction.",
      items: [
        "Reduce process waste and operational friction",
        "Improve efficiency and execution speed at scale",
        "Build systems that scale properly without breaking under load"
      ]
    }
  ];

  return (
    <section id="what-i-do" className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-3">What I Do</h2>
        <p className="text-white/60 text-sm mb-12">Tailored solutions for different business types:</p>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service.number}
              className="rounded-lg bg-gradient-to-br from-cyan/8 to-transparent border border-cyan/20 hover:border-cyan/40 transition-all group overflow-hidden"
            >
              {/* Header with icon */}
              <div className="p-6 bg-gradient-to-r from-cyan/10 to-transparent border-b border-cyan/10 group-hover:from-cyan/15 transition-colors">
                <div className="flex gap-4 items-start mb-3">
                  <div className="text-4xl">{service.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-cyan text-dark text-xs font-bold flex items-center justify-center">
                        {service.number}
                      </span>
                      <h3 className="text-white font-bold">{service.title}</h3>
                    </div>
                    <p className="text-cyan text-sm">{service.description}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="text-cyan font-bold mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-white/70 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
