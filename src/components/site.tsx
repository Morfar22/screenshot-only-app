import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LockKeyhole } from "lucide-react";
import emblem from "@/assets/emblem.png";

export const DISCORD_URL = "https://discord.gg/rzjqNSN9xx";

const nav = [
  { label: "Nordisk RP", to: "/", hash: "om" },
  { label: "Livet i byen", to: "/", hash: "byen" },
  { label: "Regler", to: "/regler" },
  { label: "Kom i gang", to: "/kom-i-gang" },
  { label: "Ansøgninger", to: "/ansogninger" },
  { label: "Status", to: "/status" },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Nordisk RP – forside">
      <img src={emblem} alt="" width={42} height={42} className="h-10 w-10 object-contain" />
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
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-foreground">Discord</a>
          <Link to="/auth" className="grid h-10 w-10 place-items-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground" aria-label="Staff-login" title="Staff-login"><LockKeyhole className="h-4 w-4" /></Link>
          <Link to="/ansog" className="btn-primary !min-h-10 !px-5">Ansøg nu</Link>
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
            <Link to="/ansog" onClick={() => setOpen(false)} className="btn-primary">Ansøg nu</Link>
            <Link to="/auth" onClick={() => setOpen(false)} className="btn-ghost"><LockKeyhole className="h-4 w-4" /> Staff-login</Link>
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
          <Link to="/status" className="hover:text-foreground">Status</Link>
          <Link to="/admin" className="hover:text-foreground">Staff</Link>
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
