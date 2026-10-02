import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, ArrowRight } from "lucide-react";
import { PageShell, DISCORD_URL } from "@/components/site";
import harbor from "@/assets/nordisk-harbor-dawn.jpg";

export const Route = createFileRoute("/kom-i-gang")({
  head: () => ({ meta: [
    { title: "Kom i gang — Nordisk RP" },
    { name: "description", content: "Fra GTA V og FiveM til regler, Discord og adgangsansøgning – sådan bliver du klar til Nordisk RP." },
    { property: "og:title", content: "Kom i gang — Nordisk RP" },
    { property: "og:description", content: "Din vej ind i Nordisk RP, samlet trin for trin." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Guide,
});

const steps = [
  { title: "Gør udstyret klar", text: "Du skal bruge en lovlig kopi af GTA V, FiveM og en mikrofon med tydelig lyd.", points: ["GTA V installeret", "FiveM klar", "Mikrofon testet"] },
  { title: "Kom ind på Discord", text: "Her foregår nyheder, hjælp og kontakten med fællesskabet.", action: "discord" as const },
  { title: "Læs reglerne", text: "Reglerne sætter standarden for alle scener. Læs dem grundigt, før du ansøger.", action: "rules" as const },
  { title: "Skab en karakter med retning", text: "Tænk over baggrund, drivkraft og svagheder. En stærk karakter behøver ikke være magtfuld – den skal kunne udvikle sig." },
  { title: "Send din ansøgning", text: "Fortæl kort om dig selv og den karakter, du vil bringe ind i byen. Staff behandler ansøgningen, og besked følger på Discord.", action: "apply" as const },
];

function Guide() {
  return <PageShell>
    <section className="relative isolate overflow-hidden border-b border-border pb-20 pt-36">
      <img src={harbor} alt="Morgen over Nordisk RPs havn" width={1600} height={1000} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/90 to-background/45" />
      <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="max-w-2xl"><span className="eyebrow">Din vej ind</span><h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Kom i gang</h1><p className="mt-5 text-lg leading-relaxed text-muted-foreground">Fra første installation til en karakter, der er klar til at møde byen.</p></div></div>
    </section>
    <section className="py-24"><div className="mx-auto max-w-4xl px-5">
      <ol className="divide-y divide-border border-y border-border">
        {steps.map((s, i) => <li key={s.title} className="grid gap-5 py-9 sm:grid-cols-[72px_1fr]">
          <span className="font-display text-5xl font-bold text-primary-glow/60">0{i + 1}</span>
          <div><h2 className="text-3xl font-bold uppercase">{s.title}</h2><p className="mt-3 max-w-2xl text-muted-foreground">{s.text}</p>
            {s.points && <ul className="mt-5 grid gap-2 sm:grid-cols-3">{s.points.map((p) => <li key={p} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary-glow" />{p}</li>)}</ul>}
            {s.action === "discord" && <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-ghost mt-5">Åbn Discord <ExternalLink className="h-4 w-4" /></a>}
            {s.action === "rules" && <Link to="/regler" className="btn-ghost mt-5">Læs reglerne <ArrowRight className="h-4 w-4" /></Link>}
            {s.action === "apply" && <Link to="/ansog" className="btn-primary mt-5">Start ansøgningen <ArrowRight className="h-4 w-4" /></Link>}
          </div>
        </li>)}
      </ol>
      <div className="engraved mt-12 flex flex-col items-start justify-between gap-5 bg-card p-7 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-bold uppercase">Sidder du fast?</h2><p className="mt-1 text-muted-foreground">Åbn en supportsag på Discord. Så hjælper fællesskabet dig videre.</p></div><a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-ghost shrink-0">Få hjælp</a></div>
    </div></section>
  </PageShell>;
}