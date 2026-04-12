export default function WhatIDo() {
  return (
    <section id="what-i-do" className="relative py-10 px-6 bg-dark border-t border-white/10">
      <div className="max-w-4xl mx-auto section-appear">
        <h2 className="text-3xl font-bold mb-6">What I Do</h2>

        <div className="space-y-8">
          <div className="p-6 rounded-lg bg-gradient-to-r from-cyan/5 to-transparent border border-cyan/10">
            <div className="flex gap-3 items-start mb-3">
              <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan text-xs font-bold">1</span>
              </div>
              <h3 className="text-white font-bold text-sm">For non-tech businesses</h3>
            </div>
            <ul className="space-y-2 text-white/70 text-sm ml-9">
              <li>• Understand what technology actually matters for your business</li>
              <li>• Avoid unnecessary tools and unnecessary complexity</li>
              <li>• Build simple, clear systems that your team understands</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-r from-cyan-dark/5 to-transparent border border-cyan/10">
            <div className="flex gap-3 items-start mb-3">
              <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan text-xs font-bold">2</span>
              </div>
              <h3 className="text-white font-bold text-sm">For tech companies</h3>
            </div>
            <ul className="space-y-2 text-white/70 text-sm ml-9">
              <li>• Reduce process waste and operational friction</li>
              <li>• Improve efficiency at scale</li>
              <li>• Build systems that scale properly without breaking</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
