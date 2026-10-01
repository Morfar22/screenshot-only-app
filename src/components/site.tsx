import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import emblem from "@/assets/emblem.png";

export const DISCORD_URL = "https://discord.gg/rzjqNSN9xx";

const nav = [
  { label: "Om Nordisk", to: "/", hash: "om" },
  { label: "Livet i byen", to: "/", hash: "byen" },
  { label: "Regler", to: "/regler" },
  { label: "Nyheder", to: "/", hash: "nyheder" },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Nordisk RP – forside">
      <span className="grid h-9 w-9 place-items-center rounded-sm border border-primary/60 bg-card font-display text-lg font-bold text-foreground">
        N
      </span>
      <span className="font-display text-xl font-bold uppercase tracking-wider">
        Nordisk <span className="text-primary-glow">RP</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = scrolled || open;
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-border bg-background/95 backdrop-blur" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Hovedmenu">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              {...("hash" in n ? { hash: n.hash } : {})}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              {...("hash" in n ? {} : { activeProps: { className: "text-foreground underline decoration-primary-glow decoration-2 underline-offset-8" } })}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Discord
          </a>
          <Link to="/auth" className="btn-ghost !min-h-10 !px-5">Log ind</Link>
          <Link to="/kom-i-gang" className="btn-primary !min-h-10 !px-5">Kom i gang</Link>
        </div>
        <button className="grid h-11 w-11 place-items-center lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Luk menu" : "Åbn menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 pb-6 lg:hidden" aria-label="Mobilmenu">
          {nav.map((n) => (
            <Link key={n.label} to={n.to} {...("hash" in n ? { hash: n.hash } : {})} onClick={() => setOpen(false)} className="block border-b border-border py-4 text-lg font-medium">
              {n.label}
            </Link>
          ))}
          <div className="mt-5 grid gap-3">
            <Link to="/kom-i-gang" onClick={() => setOpen(false)} className="btn-primary">Kom i gang</Link>
            <Link to="/auth" onClick={() => setOpen(false)} className="btn-ghost">Log ind</Link>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-ghost">Mød os på Discord</a>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <img src={emblem} alt="" width={48} height={48} loading="lazy" className="h-12 w-12" />
          <p className="text-sm text-muted-foreground">Nordisk RP · Et dansk FiveM-fællesskab. Ikke tilknyttet Rockstar Games.</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/regler" className="hover:text-foreground">Regler</Link>
          <Link to="/kom-i-gang" className="hover:text-foreground">Kom i gang</Link>
          <Link to="/staff" className="hover:text-foreground">Staff</Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">Hjælp på Discord</a>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
