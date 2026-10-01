import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Link2 } from "lucide-react";
import { PageShell } from "@/components/site";

export const Route = createFileRoute("/regler")({
  head: () => ({
    meta: [
      { title: "Regler — Nordisk RP" },
      { name: "description", content: "Serverreglerne for Nordisk RP, opdelt i tydelige kategorier med eksempler." },
      { property: "og:title", content: "Regler — Nordisk RP" },
      { property: "og:description", content: "Kend rammerne for rollespillet på Nordisk RP." },
    ],
  }),
  component: Rules,
});

const UPDATED = "1. oktober 2026";

const sections = [
  { id: "generelt", title: "Generelt", rules: [
    { id: "1.1", text: "Behandl alle med respekt – både i og uden for rollespillet.", example: "Uenigheder uden for rollespil tages i en supportsag, ikke i chatten." },
    { id: "1.2", text: "Du skal være fyldt 16 år for at spille på serveren." },
  ]},
  { id: "rollespil", title: "Rollespil", rules: [
    { id: "2.1", text: "Bliv i din karakter, mens du er på serveren.", example: "Taler du om noget uden for spillet, så brug OOC-chatten kortvarigt." },
    { id: "2.2", text: "Værdsæt dit liv (fear RP). Din karakter skal reagere realistisk på trusler." },
    { id: "2.3", text: "Metagaming – at bruge viden din karakter ikke har – er ikke tilladt." },
  ]},
  { id: "kriminalitet", title: "Kriminalitet", rules: [
    { id: "3.1", text: "Kriminelle handlinger skal have en rollespilsmæssig begrundelse.", example: "Et røveri uden forudgående dialog eller formål er ikke god RP." },
    { id: "3.2", text: "Random deathmatch (RDM) og vehicle deathmatch (VDM) er forbudt." },
  ]},
  { id: "support", title: "Support og sanktioner", rules: [
    { id: "4.1", text: "Regelbrud rapporteres via en supportsag på Discord – ikke i private beskeder til staff." },
    { id: "4.2", text: "Sanktioner vurderes ud fra situationen og tidligere historik." },
  ]},
];

function Rules() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sections;
    return sections
      .map((s) => ({ ...s, rules: s.rules.filter((r) => (r.text + " " + (r.example ?? "")).toLowerCase().includes(t)) }))
      .filter((s) => s.rules.length);
  }, [q]);

  return (
    <PageShell>
      <section className="border-b border-border pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Regelsæt</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Regler</h1>
          <p className="mt-4 text-muted-foreground">Senest opdateret {UPDATED}</p>
          <label className="engraved mt-8 flex max-w-xl items-center gap-3 rounded-sm bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Søg i reglerne</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg i reglerne…" className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[220px_1fr] lg:px-8">
        <nav aria-label="Kategorier" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block whitespace-nowrap rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary-glow hover:text-foreground lg:border-0 lg:border-l-2 lg:px-4">{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14">
          {filtered.length === 0 && <p className="text-muted-foreground">Ingen regler matcher “{q}”.</p>}
          {filtered.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-3xl font-bold uppercase">{s.title}</h2>
              <div className="mt-6 space-y-4">
                {s.rules.map((r) => (
                  <article key={r.id} id={`regel-${r.id}`} className="engraved scroll-mt-24 rounded-sm bg-card p-6">
                    <div className="flex items-start gap-4">
                      <span className="font-display text-lg font-bold text-primary-glow">§{r.id}</span>
                      <div className="flex-1">
                        <p className="text-foreground">{r.text}</p>
                        {r.example && <p className="mt-3 border-l-2 border-border pl-4 text-sm text-muted-foreground"><strong className="text-foreground/80">Eksempel:</strong> {r.example}</p>}
                      </div>
                      <a href={`#regel-${r.id}`} aria-label={`Direkte link til regel ${r.id}`} className="text-muted-foreground hover:text-foreground"><Link2 className="h-4 w-4" /></a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
