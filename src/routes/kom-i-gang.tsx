import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, DISCORD_URL } from "@/components/site";

export const Route = createFileRoute("/kom-i-gang")({
  head: () => ({
    meta: [
      { title: "Kom i gang — Nordisk RP" },
      { name: "description", content: "Den samlede guide for nye spillere: forberedelse, adgang, tilslutning og dine første skridt i byen." },
      { property: "og:title", content: "Kom i gang — Nordisk RP" },
      { property: "og:description", content: "Sådan kommer du ind i Nordisk RP – trin for trin." },
    ],
  }),
  component: Guide,
});

const steps = [
  { title: "Forbered dig", text: "Du skal bruge en lovlig kopi af GTA V, FiveM installeret og en fungerende mikrofon.", faq: { q: "Hvorfor kræves mikrofon?", a: "Rollespillet foregår primært via stemme i spillet." }, next: "Når FiveM virker, går du videre til Discord." },
  { title: "Bliv en del af Discord", text: "Discord er vores samlingspunkt for nyheder, ansøgninger og support.", action: { label: "Åbn Discord", href: DISCORD_URL }, next: "Herefter læser du reglerne." },
  { title: "Læs reglerne", text: "Reglerne beskriver rammerne for godt rollespil. Du bliver spurgt ind til dem i ansøgningen.", link: { label: "Læs reglerne", to: "/regler" as const }, next: "Så er du klar til at ansøge." },
  { title: "Send en adgangsansøgning", text: "Nordisk RP bruger whitelist: en kort adgangsansøgning, hvor du fortæller lidt om dig selv og din karakteridé.", link: { label: "Ansøg nu", to: "/ansog" as const }, faq: { q: "Hvor lang tid tager det?", a: "Du får besked på Discord, når ansøgningen er behandlet." }, next: "Når du er godkendt, kan du forbinde." },
  { title: "Forbind og skab din karakter", text: "Find Nordisk RP i FiveM-serverlisten, forbind og opret din karakter. Tag dig tid – den skal holde.", next: "Velkommen i byen. Er du i tvivl, så opret en supportsag på Discord." },
];

function Guide() {
  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-3xl px-5">
          <span className="eyebrow">Guide for nye spillere</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Kom i gang</h1>
          <p className="mt-4 text-lg text-muted-foreground">Fem trin fra nysgerrig til borger i byen. Hvert trin fortæller, hvad du skal gøre nu – og hvad der sker bagefter.</p>
          <ol className="mt-14 space-y-6 border-l border-border pl-8">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="absolute -left-[3.05rem] grid h-9 w-9 place-items-center rounded-sm border border-primary bg-background font-display font-bold">{i + 1}</span>
                <div className="engraved rounded-sm bg-card p-6">
                  <h2 className="text-2xl font-bold uppercase">{s.title}</h2>
                  <p className="mt-3 text-muted-foreground">{s.text}</p>
                  {s.faq && (
                    <details className="mt-4 rounded-sm border border-border px-4 py-3">
                      <summary className="cursor-pointer text-sm font-semibold">{s.faq.q}</summary>
                      <p className="mt-2 text-sm text-muted-foreground">{s.faq.a}</p>
                    </details>
                  )}
                  {s.action && <a href={s.action.href} target="_blank" rel="noreferrer" className="btn-primary mt-5">{s.action.label}</a>}
                  {s.link && <Link to={s.link.to} className="btn-ghost mt-5">{s.link.label}</Link>}
                  <p className="mt-5 text-sm text-foreground/70"><span className="font-semibold text-primary-glow">Bagefter:</span> {s.next}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
