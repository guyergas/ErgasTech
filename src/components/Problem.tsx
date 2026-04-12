export default function Problem() {
  const outcomes = [
    "Less confusion and tool chaos",
    "Clear direction for your team",
    "Better workflows and less wasted effort",
    "Faster execution",
    "Reduced waste",
    "Systems that scale"
  ];

  return (
    <section id="what-this-means" className="relative py-8 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-6">What This Means For Your Business</h2>

        <div className="space-y-3">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex gap-3 items-start">
              <span className="text-cyan text-lg font-bold mt-0.5">✓</span>
              <p className="text-white/70 text-sm">{outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
