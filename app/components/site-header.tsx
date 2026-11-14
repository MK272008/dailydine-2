"use client";

import Image from "next/image";
import Link from "next/link";
import { ComponentProps, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const activeUrl = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    closeMenu();
  }, [activeUrl]);

  return (
    <header className="sticky top-0 z-20 border-b border-line/90 bg-paper/95">
      <div className="mx-auto flex min-h-[82px] w-[calc(100%-3rem)] max-w-[78rem] items-center justify-between gap-6 max-[480px]:min-h-[70px] max-[480px]:w-[calc(100%-1.25rem)]">
        <Link className="inline-flex items-center gap-3 text-wine no-underline" href="/" onClick={closeMenu} aria-label="Daily Dine home">
          <Image className="h-11 w-11 rounded-full object-cover shadow-daily-soft" src="/logo.jpeg" alt="Daily Dine" width={52} height={52} priority />
          <span className="grid min-w-0 gap-0.5">
            <strong className="font-serif text-xl font-bold tracking-[-0.035em]">Daily Dine</strong>
            <small className="overflow-hidden text-[0.63rem] font-extrabold uppercase tracking-[0.08em] text-muted">Hassle free dining</small>
          </span>
        </Link>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-wine lg:hidden"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="sr-only">Toggle navigation</span>
          <span className="grid w-4 gap-1" aria-hidden="true">
            <span className={`block h-0.5 rounded-full bg-current transition ${menuOpen ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`block h-0.5 rounded-full bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 rounded-full bg-current transition ${menuOpen ? "-translate-y-1 -rotate-45" : ""}`} />
          </span>
        </button>
        <nav id="primary-navigation" className={`absolute left-5 right-5 top-[calc(100%-0.25rem)] ${menuOpen ? "flex" : "hidden"} flex-col items-stretch rounded-2xl border border-line bg-surface p-2 shadow-daily-soft lg:static lg:flex lg:flex-row lg:items-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`} aria-label="Primary navigation">
          <NavLink activeUrl={activeUrl} href="/#how-it-works" onClick={closeMenu}>How it works</NavLink>
          <NavLink activeUrl={activeUrl} href="/demo/green-table/table/4" onClick={closeMenu}>Guest demo</NavLink>
          <span className="mx-2 my-1 h-px w-auto bg-line lg:h-6 lg:w-px" aria-hidden="true" />
          <NavLink activeUrl={activeUrl} href="/demo/staff" onClick={closeMenu}>Staff queue</NavLink>
          <NavLink activeUrl={activeUrl} href="/demo/owner" onClick={closeMenu}>Owner Dashboard</NavLink>
          <span className="mx-2 my-1 h-px w-auto bg-line lg:h-6 lg:w-px" aria-hidden="true" />
          <Link className="inline-flex items-center rounded-full px-3 py-2 text-[0.82rem] font-extrabold text-muted no-underline transition hover:bg-surface hover:text-wine max-lg:justify-start max-lg:rounded-xl max-lg:p-3" href="/login" onClick={closeMenu}>Log in</Link>
          <Link className="m-1 inline-flex items-center justify-center gap-2 rounded-full bg-wine px-4 py-3 text-[0.82rem] font-extrabold text-surface no-underline hover:bg-wine-deep lg:ml-1" href="/signup" onClick={closeMenu}>Sign up for free <span aria-hidden="true">→</span></Link>
        </nav>
      </div>
    </header>
  );
}


  function NavLink({ href, activeUrl, children, ...props }: ComponentProps<typeof Link> & { href: string; activeUrl: string, children: React.ReactNode }) {
    return (
      <Link className="inline-flex items-center rounded-full px-3 py-2 text-[0.82rem] font-extrabold text-muted no-underline transition hover:bg-surface hover:text-wine max-lg:justify-start max-lg:rounded-xl max-lg:p-3" href={href} {...props} style={href === activeUrl ? { fontWeight: "bold", color: "#5e1b2b" } : undefined}>
        {children}
      </Link>
    );
}
