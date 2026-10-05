import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Link2 } from "lucide-react";
import { PageShell } from "@/components/site";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listRules } from "@/lib/rules.functions";

export const Route = createFileRoute("/regler")({
  head: () => ({
    meta: [
      { title: "Regler — Nordisk RP" },
      { name: "description", content: "Den officielle, søgbare regeloversigt for Nordisk RP – alle regler samlet og søgbare." },
      { property: "og:title", content: "Regler — Nordisk RP" },
      { property: "og:description", content: "Find alle Nordisk RP-regler samlet i ni overskuelige kategorier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(rulesQuery),
  errorComponent: () => <PageShell><p className="mx-auto max-w-7xl px-5 pt-32 text-muted-foreground">Reglerne kunne ikke hentes lige nu. Prøv igen om lidt.</p></PageShell>,
  notFoundComponent: () => <PageShell><p className="mx-auto max-w-7xl px-5 pt-32">Ikke fundet.</p></PageShell>,
  component: Rules,
});

const rulesQuery = queryOptions({ queryKey: ["rules"], queryFn: () => listRules() });

function Rules() {
  const { data } = useSuspenseQuery(rulesQuery);
  const sections = data.map((s) => ({ ...s, rules: s.rules.map((r) => ({ id: r.number, title: r.title, text: r.body.split(/\n\s*\n/).filter(Boolean), updated: r.updated_at })) }));
  const TOTAL = sections.reduce((n, s) => n + s.rules.length, 0);
  const latest = sections.flatMap((s) => s.rules.map((r) => r.updated)).sort().pop();
  const UPDATED = latest ? new Date(latest).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" }) : "";
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return sections;
    return sections
      .map((s) => ({ ...s, rules: s.rules.filter((r) => (r.title + " " + r.text.join(" ")).toLowerCase().includes(t)) }))
      .filter((s) => s.rules.length);
  }, [q, data]);

  return (
    <PageShell>
      <section className="border-b border-border pb-12 pt-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <span className="eyebrow">Officiel regelsamling</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Regler</h1>
          <p className="mt-4 text-muted-foreground">{TOTAL} regler i {sections.length} kategorier · Senest opdateret {UPDATED}</p>
          <label className="engraved mt-8 flex max-w-xl items-center gap-3 rounded-sm bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Søg i reglerne</span>
            <input aria-label="Søg i reglerne" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg i reglerne…" className="h-12 w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 lg:grid-cols-[240px_1fr] lg:px-8">
        <nav aria-label="Kategorier" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="scrollbar-none flex gap-2 overflow-x-auto lg:flex-col">
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
                        <h3 className="font-semibold text-foreground">{r.title}</h3>
                        {r.text.map((p, i) => (
                          <p key={i} className={i === 0 ? "mt-1 text-foreground/90" : "mt-2 text-foreground/90"}>{p}</p>
                        ))}
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
