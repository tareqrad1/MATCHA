/** Minimal luxury footer. */
export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-ink px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-2.5 font-display text-2xl font-semibold uppercase tracking-[0.3em] text-cream">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-matcha shadow-[0_0_12px_rgba(138,160,95,0.8)]" />
          MATCHA
        </div>

        <p className="font-sans text-sm font-light text-white/35">
          Ceremonial-grade matcha, served cold. A quiet ritual.
        </p>

        <div className="flex gap-7">
          {['Instagram', 'Journal', 'Contact'].map((l) => (
            <a
              key={l}
              href="#"
              className="font-sans text-sm font-light text-white/45 transition-colors duration-300 hover:text-matcha"
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      <p className="mt-12 text-center font-sans text-xs text-white/20">
        © 2026 MATCHA. Grown in shade, ground by stone, poured slow.
      </p>
    </footer>
  );
}
