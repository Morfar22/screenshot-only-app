import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Pencil, Plus, Trash2, Save, X } from "lucide-react";
import { listRules, saveRule, deleteRule, saveSection, deleteSection, type RuleSection } from "@/lib/rules.functions";
import { adminHead, AdminTitle } from "./route";

export const Route = createFileRoute("/_authenticated/admin/regler")({
  head: adminHead("Regler"),
  component: Page,
});

type Draft = { id?: string; section_id: string; number: string; title: string; body: string; sort: number };
const field = "w-full rounded-sm border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary";

function Page() {
  const qc = useQueryClient();
  const list = useServerFn(listRules);
  const save = useServerFn(saveRule);
  const del = useServerFn(deleteRule);
  const saveSec = useServerFn(saveSection);
  const delSec = useServerFn(deleteSection);
  const { data, isLoading } = useQuery({ queryKey: ["rules"], queryFn: () => list() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [newSec, setNewSec] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setErr("");
    try { await fn(); await qc.invalidateQueries({ queryKey: ["rules"] }); return true; }
    catch (e) { setErr(e instanceof Error ? e.message : "Noget gik galt"); return false; }
  }

  function newRule(s: RuleSection) {
    const last = s.rules[s.rules.length - 1];
    const prefix = last?.number.split(".")[0] ?? "";
    const next = last ? `${prefix}.${Number(last.number.split(".")[1] ?? 0) + 1}` : "";
    setDraft({ section_id: s.id, number: next, title: "", body: "", sort: (last?.sort ?? -1) + 1 });
  }

  const t = q.trim().toLowerCase();

  return (
    <>
      <AdminTitle eyebrow="Indhold" title="Regler">Ret, tilføj og slet regler. Ændringer vises med det samme på den offentlige regelside.</AdminTitle>
      {err && <p className="mb-4 text-sm text-primary-glow">{err}</p>}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg i reglerne…" aria-label="Søg i reglerne" className={field} />
      {isLoading && <p className="mt-6 text-muted-foreground">Henter…</p>}
      <div className="mt-6 space-y-10">
        {(data ?? []).map((s) => {
          const rules = s.rules.filter((r) => !t || `${r.number} ${r.title} ${r.body}`.toLowerCase().includes(t));
          if (t && !rules.length) return null;
          return (
            <section key={s.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold uppercase">{s.title} <span className="text-sm font-normal text-muted-foreground">({s.rules.length})</span></h2>
                <div className="flex gap-2">
                  <button className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => { const n = window.prompt("Nyt navn på kategorien", s.title); if (n?.trim()) run(() => saveSec({ data: { id: s.id, title: n.trim() } })); }}><Pencil className="h-4 w-4" /> Omdøb</button>
                  <button className="btn-ghost !min-h-9 !px-3 text-sm" onClick={() => { if (window.confirm(`Slet kategorien "${s.title}" og alle ${s.rules.length} regler i den? Det kan ikke fortrydes.`)) run(() => delSec({ data: { id: s.id, title: s.title } })); }}><Trash2 className="h-4 w-4" /> Slet</button>
                  <button className="btn-primary !min-h-9 !px-3 text-sm" onClick={() => newRule(s)}><Plus className="h-4 w-4" /> Ny regel</button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {draft && !draft.id && draft.section_id === s.id && <Editor draft={draft} setDraft={setDraft} onSave={() => run(() => save({ data: draft })).then((ok) => ok && setDraft(null))} />}
                {rules.map((r) => draft?.id === r.id ? (
                  <Editor key={r.id} draft={draft} setDraft={setDraft} onSave={() => run(() => save({ data: draft })).then((ok) => ok && setDraft(null))} />
                ) : (
                  <article key={r.id} className="engraved flex items-start gap-4 rounded-sm bg-card p-4">
                    <span className="font-display font-bold text-primary-glow">§{r.number}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{r.title}</h3>
                      <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-muted-foreground">{r.body}</p>
                    </div>
                    <button aria-label={`Ret §${r.number}`} className="btn-ghost !min-h-9 !px-3" onClick={() => setDraft({ id: r.id, section_id: s.id, number: r.number, title: r.title, body: r.body, sort: r.sort })}><Pencil className="h-4 w-4" /></button>
                    <button aria-label={`Slet §${r.number}`} className="btn-ghost !min-h-9 !px-3" onClick={() => { if (window.confirm(`Slet §${r.number} ${r.title}?`)) run(() => del({ data: { id: r.id, label: `§${r.number} ${r.title}` } })); }}><Trash2 className="h-4 w-4" /></button>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <form className="engraved mt-10 flex flex-wrap gap-3 rounded-sm bg-card p-4" onSubmit={(e) => { e.preventDefault(); if (newSec.trim()) run(() => saveSec({ data: { title: newSec.trim() } })).then((ok) => ok && setNewSec("")); }}>
        <input value={newSec} onChange={(e) => setNewSec(e.target.value)} maxLength={80} placeholder="Navn på ny kategori" aria-label="Navn på ny kategori" className={`${field} flex-1`} />
        <button className="btn-primary"><Plus className="h-4 w-4" /> Opret kategori</button>
      </form>
    </>
  );
}

function Editor({ draft, setDraft, onSave }: { draft: Draft; setDraft: (d: Draft | null) => void; onSave: () => void }) {
  return (
    <div className="engraved space-y-3 rounded-sm border-primary bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <label className="text-sm font-semibold">Nummer<input value={draft.number} maxLength={20} onChange={(e) => setDraft({ ...draft, number: e.target.value })} className={`${field} mt-1`} /></label>
        <label className="text-sm font-semibold">Titel<input value={draft.title} maxLength={150} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={`${field} mt-1`} /></label>
      </div>
      <label className="block text-sm font-semibold">Tekst <span className="font-normal text-muted-foreground">(tom linje = nyt afsnit)</span>
        <textarea rows={6} value={draft.body} maxLength={5000} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className={`${field} mt-1`} />
      </label>
      <div className="flex gap-2">
        <button className="btn-primary" onClick={onSave} disabled={!draft.number.trim() || !draft.title.trim()}><Save className="h-4 w-4" /> Gem</button>
        <button className="btn-ghost" onClick={() => setDraft(null)}><X className="h-4 w-4" /> Annuller</button>
      </div>
    </div>
  );
}
