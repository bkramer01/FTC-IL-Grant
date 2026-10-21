import type { ReactNode } from "react";

/** Dark utility bar at the top of every page, matching firstillinoisrobotics.org. */
export function SiteHeader({ title = "Grants" }: { title?: string }) {
  return (
    <header>
      <div className="bg-utility text-white/75 text-sm">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4">
          <span className="sm:hidden font-medium text-white">FTC {title}</span>
          <span className="hidden sm:inline">FIRST Tech Challenge · Illinois</span>
          <a href="https://www.firstillinoisrobotics.org/" className="text-white/75 no-underline hover:text-white">
            firstillinoisrobotics.org
          </a>
        </div>
      </div>
    </header>
  );
}

/** The FIRST blue band under the header. Admin pages put their menu here. */
export function ProgramBar({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-first-blue text-white">
      <div className="mx-auto flex min-h-11 max-w-7xl flex-wrap items-center px-4">{children}</div>
    </div>
  );
}

export function MockupBanner() {
  return (
    <div role="status" className="bg-warning text-ink">
      <div className="mx-auto max-w-7xl px-4 py-2 text-sm font-semibold">
        ⚠ MOCKUP: form responses and team names are a snapshot of the Google Sheets (Refresh Data isn&apos;t connected
        yet). Your entries and changes are saved.
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line py-10 text-sm">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-3 text-base font-medium">Grant questions</h2>
        <p className="text-ink/75">
          Jonathan Weiland ·{" "}
          <a href="mailto:jweiland@firstillinoisrobotics.org" className="text-ink/75 no-underline hover:text-ink">
            jweiland@firstillinoisrobotics.org
          </a>
        </p>
      </div>
      <p className="mx-auto mt-8 max-w-7xl px-4 text-ink/60">
        © {new Date().getFullYear()} FIRST Illinois Robotics. FIRST Tech Challenge Illinois Matching Grants 2026–27.
      </p>
    </footer>
  );
}

/** Bootstrap-style card with an H2 header. */
export function Card({
  title,
  actions,
  children,
  id,
}: {
  title: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mb-6 overflow-hidden rounded-md border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-panel px-4 py-3">
        <h2 className="text-2xl sm:text-[1.75rem]">{title}</h2>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Alert({
  tone,
  children,
  compact = false,
}: {
  tone: "success" | "danger" | "warning" | "info";
  children: ReactNode;
  /** A small inline box with smaller text, for low-key notes. */
  compact?: boolean;
}) {
  const cls = {
    success: "bg-success-bg border-success/40 text-[#0a3622]",
    danger: "bg-danger-bg border-danger/40 text-[#58151c]",
    warning: "bg-warning-bg border-warning/60 text-[#664d03]",
    info: "bg-[#cff4fc] border-info/60 text-[#055160]",
  }[tone];
  const size = compact ? "inline-block px-2.5 py-1 text-sm" : "px-4 py-3";
  return <div className={`mb-4 rounded-md border ${size} ${cls}`}>{children}</div>;
}

/** Explains the yellow column headers. */
export function ManualKey() {
  return (
    <p className="mb-3 text-sm text-muted">
      <span className="mr-1 inline-block h-3 w-3 border border-warning bg-manual align-middle" /> Yellow headers are
      columns the Grant Administrator fills in; the rest come from the form, the BioBuzz data sheet or are calculated.
    </p>
  );
}
