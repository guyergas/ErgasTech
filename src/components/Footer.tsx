export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-dark border-t border-cyan/10 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Footer Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan to-cyan-dark rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-dark">ET</span>
              </div>
              <span className="text-lg font-bold">ErgasTech</span>
            </div>
            <p className="text-white/50 text-xs">
              Systems & Engineering Strategy
            </p>
            <p className="text-white/50 text-xs">
              Guy Ergas
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="font-bold text-white text-sm mb-2">Get in Touch</p>
            <p className="text-white/70 text-xs">
              <a href="mailto:guyergas@gmail.com" className="hover:text-cyan transition-colors">
                guyergas@gmail.com
              </a>
            </p>
            <p className="text-white/70 text-xs">
              <a href="tel:+972523333687" className="hover:text-cyan transition-colors">
                +972 52 333 3687
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-white/40 text-xs">
          <p>&copy; {currentYear} ErgasTech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
