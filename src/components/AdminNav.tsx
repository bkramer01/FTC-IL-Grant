"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/emails", label: "Email Log" },
  { href: "/responses", label: "Form Responses" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="-ml-3 flex flex-wrap">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`px-3 py-2.5 text-white no-underline hover:bg-first-blue-dark hover:text-white ${active ? "bg-first-blue-dark" : ""}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
