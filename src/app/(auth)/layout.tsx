import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* ── Brand panel ──────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[440px] xl:w-[500px] bg-primary flex-col shrink-0 relative overflow-hidden">
        {/* Logo */}
        <div className="p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              className="w-7 h-7 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
            </svg>
            <span className="text-xl font-bold text-primary-foreground tracking-tight">
              Landscaip
            </span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="flex-1 flex flex-col justify-center px-10 pb-16">
          <p className="text-primary-foreground/60 text-xs font-semibold uppercase tracking-widest mb-5">
            AI Landscape Design
          </p>
          <h2 className="text-[2.6rem] font-bold text-primary-foreground leading-[1.1] mb-10">
            Your landscape,<br />reimagined.
          </h2>
          <ul className="space-y-5">
            {[
              "16 professional style presets",
              "AI-generated designs in seconds",
              "3 free credits — no card required",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary-foreground/80 mt-0.5 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-primary-foreground/85 text-sm leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative watermark leaf */}
        <div
          className="absolute -bottom-12 -right-12 w-80 h-80 text-primary-foreground/10 pointer-events-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
          </svg>
        </div>
      </div>

      {/* ── Form area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo bar */}
        <header className="lg:hidden h-16 border-b border-border flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C12 3 8 3 6 5c-3 3-3 7-3 7 0 0 4-4 14-4z" />
            </svg>
            <span className="font-bold text-lg text-primary">Landscaip</span>
          </Link>
        </header>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
