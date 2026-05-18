export default function Problem() {
  const outcomes = [
    { title: "Less Tool Chaos", description: "Eliminate unnecessary complexity and redundant systems" },
    { title: "Clear Direction", description: "Your team knows what's expected and why it matters" },
    { title: "Better Workflows", description: "Less manual work, fewer hand-offs, less waste" },
    { title: "Faster Execution", description: "Move quickly when your systems are clear and optimized" },
    { title: "Reduced Costs", description: "Eliminate waste and run operations more efficiently" },
    { title: "Systems That Scale", description: "Build foundations that grow with your business" }
  ];

  return (
    <section id="what-this-means" className="relative py-16 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-3">What This Means For Your Business</h2>
        <p className="text-white/60 text-sm mb-10">When systems are clear and optimized:</p>

        <div className="grid md:grid-cols-2 gap-4">
          {outcomes.map((outcome, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gradient-to-br from-cyan/8 to-transparent border border-cyan/15 hover:border-cyan/30 transition-all group"
            >
              <div className="flex gap-3 items-start">
                <span className="text-cyan font-bold text-lg mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform origin-left">
                  ✓
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-cyan transition-colors">
                    {outcome.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{outcome.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
