export default function Solution() {
  const steps = [
    {
      number: 1,
      title: "Understand",
      description: "How do you actually work today? Where's the waste? What's causing friction?"
    },
    {
      number: 2,
      title: "Identify",
      description: "Where can structure make the biggest impact? What are the leverage points?"
    },
    {
      number: 3,
      title: "Design",
      description: "Build a clear system. Simple to use. Everyone knows what happens when."
    },
    {
      number: 4,
      title: "Implement",
      description: "Set it up. Train your team. You run it on your own."
    }
  ];

  return (
    <section id="how-i-work" className="relative py-8 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-6">How I Work</h2>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex gap-3 items-start">
                <span className="text-cyan font-bold text-lg flex-shrink-0">{step.number}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1 text-sm">{step.title}</h3>
                  <p className="text-white/60 text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
