import type { ReactNode } from "react";

/** Dark utility bar at the top of every page, matching firstillinoisrobotics.org. */
export function SiteHeader({ title = "Grants" }: { title?: string }) {
  return (
    <header>
      <div className="bg-utility text-white/75 text-sm">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4">
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

/** The orange FTC band under the header. */
export function ProgramBar({ children }: { children?: ReactNode }) {
  return (
    <div className="bg-ftc text-white">
      <div className="mx-auto flex min-h-11 max-w-6xl flex-wrap items-center px-4">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-line py-10 text-sm">
      <p className="mx-auto max-w-6xl px-4 text-ink/60">
        © {new Date().getFullYear()} FIRST Illinois Robotics. FIRST Tech Challenge Illinois Grants.
      </p>
    </footer>
  );
}

/** Bootstrap-style card with an H2 header. */
export function Card({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-6 overflow-hidden rounded-md border border-line bg-white">
      <div className="border-b border-line bg-panel px-4 py-3">
        <h2 className="text-2xl sm:text-[1.9rem]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
