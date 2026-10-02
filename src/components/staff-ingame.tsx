import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, RotateCcw, Plus, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Question = { label: string; required: boolean; long: boolean };
type Status = "afventer" | "godkendt" | "afvist";
const inputCls = "w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none";

export function IngamePanel() {
  return (
    <section className="mt-16 border-t border-border pt-10" aria-label="Ansøgninger i spillet">
      <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Ansøgninger i spillet</h2>
      <p className="mt-2 text-muted-foreground">Opret ansøgningstyper her. De vises automatisk i laptop-appen i spillet, og svarene lander nedenfor.</p>
      <IngameApplications />
      <TypeEditor />
      <ApiKeyBox />
    </section>
  );
}

function IngameApplications() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("afventer");
  const [query, setQuery] = useState("");
  const { data } = useQuery({
    queryKey: ["staff-ingame-apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingame_applications")
        .select("id,player_name,fivem_identifier,answers,status,created_at,application_types(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  async function setStatus(id: string, status: Status) {
    await supabase.from("ingame_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["staff-ingame-apps"] });
  }
  const q = query.trim().toLowerCase();
  const list = (data ?? []).filter(
    (a) =>
      a.status === tab &&
      (!q ||
        a.player_name.toLowerCase().includes(q) ||
        a.fivem_identifier.toLowerCase().includes(q) ||
        ((a.application_types as { title: string } | null)?.title ?? "").toLowerCase().includes(q) ||
        ((a.answers as { question: string; answer: string }[]) ?? []).some(
          (x) => x.question.toLowerCase().includes(q) || x.answer.toLowerCase().includes(q),
        )),
  );
  return (
    <div className="mt-6">
      <div className="scrollbar-none flex gap-2 overflow-x-auto border-b border-border" role="tablist">
        {(["afventer", "godkendt", "afvist"] as Status[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold capitalize ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t} ({(data ?? []).filter((a) => a.status === t).length})
          </button>
        ))}
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Søg på spiller, type eller svar…"
        aria-label="Søg i ansøgninger"
        className="mt-4 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none"
      />
      <div className="mt-6 space-y-4">
        {list.length === 0 && <p className="text-muted-foreground">Ingen ansøgninger her.</p>}
        {list.map((a) => (
          <article key={a.id} className="engraved rounded-sm bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-2xl font-bold">{(a.application_types as { title: string } | null)?.title ?? "Ansøgning"}</h3>
              <span className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString("da-DK")}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Spiller: <span className="text-foreground">{a.player_name || "Ukendt"}</span> · <span className="break-all">{a.fivem_identifier}</span></p>
            {((a.answers as { question: string; answer: string }[]) ?? []).map((x, i) => (
              <div key={i} className="mt-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">{x.question}</h4>
                <p className="mt-1 whitespace-pre-wrap text-foreground/90">{x.answer || "—"}</p>
              </div>
            ))}
            <div className="mt-5 flex flex-wrap gap-2">
              {a.status !== "godkendt" && <button onClick={() => setStatus(a.id, "godkendt")} className="btn-primary"><Check className="h-4 w-4" /> Godkend</button>}
              {a.status !== "afvist" && <button onClick={() => setStatus(a.id, "afvist")} className="btn-ghost"><X className="h-4 w-4" /> Afvis</button>}
              {a.status !== "afventer" && <button onClick={() => setStatus(a.id, "afventer")} className="btn-ghost"><RotateCcw className="h-4 w-4" /> Sæt til afventer</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TypeEditor() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([{ label: "", required: true, long: false }]);
  const { data } = useQuery({
    queryKey: ["staff-app-types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("application_types").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["staff-app-types"] });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const qs = questions.filter((q) => q.label.trim()).map((q) => ({ ...q, label: q.label.trim() }));
    if (!title.trim() || qs.length === 0) return;
    await supabase.from("application_types").insert({ title: title.trim(), description, questions: qs });
    setTitle(""); setDescription(""); setQuestions([{ label: "", required: true, long: false }]);
    refresh();
  }
  const upd = (i: number, p: Partial<Question>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...p } : q)));

  return (
    <div className="engraved mt-10 rounded-sm bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Ansøgningstyper</h3>
      <ul className="mt-4 space-y-3">
        {(data ?? []).map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="font-semibold">{t.title} {!t.is_open && <span className="text-sm text-muted-foreground">(lukket)</span>}</p>
              <p className="text-sm text-muted-foreground">{(t.questions as Question[]).length} spørgsmål</p>
            </div>
            <div className="flex gap-2">
              <button onClick={async () => { await supabase.from("application_types").update({ is_open: !t.is_open }).eq("id", t.id); refresh(); }} className="btn-ghost !min-h-9 !px-3">
                {t.is_open ? <><EyeOff className="h-4 w-4" /> Luk</> : <><Eye className="h-4 w-4" /> Åbn</>}
              </button>
              <button onClick={async () => { if (confirm(`Slet "${t.title}" og alle dens ansøgninger?`)) { await supabase.from("application_types").delete().eq("id", t.id); refresh(); } }} className="btn-ghost !min-h-9 !px-3" aria-label={`Slet ${t.title}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
        {(data ?? []).length === 0 && <li className="text-sm text-muted-foreground">Ingen ansøgningstyper endnu.</li>}
      </ul>

      <form onSubmit={create} className="mt-6 grid gap-4">
        <p className="font-semibold">Ny ansøgningstype</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel (fx 'Politiansøgning')" className={inputCls} maxLength={80} required aria-label="Titel" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Kort beskrivelse (valgfri)" className={`${inputCls} min-h-20`} maxLength={500} aria-label="Beskrivelse" />
        {questions.map((q, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <input value={q.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder={`Spørgsmål ${i + 1}`} className={inputCls} maxLength={300} aria-label={`Spørgsmål ${i + 1}`} />
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={q.required} onChange={(e) => upd(i, { required: e.target.checked })} className="accent-primary" /> Påkrævet</label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={q.long} onChange={(e) => upd(i, { long: e.target.checked })} className="accent-primary" /> Langt svar</label>
            <button type="button" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))} className="btn-ghost !min-h-9 !px-3" aria-label="Fjern spørgsmål" disabled={questions.length === 1}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setQuestions((qs) => [...qs, { label: "", required: false, long: false }])} className="btn-ghost" disabled={questions.length >= 30}><Plus className="h-4 w-4" /> Tilføj spørgsmål</button>
          <button type="submit" className="btn-primary"><Check className="h-4 w-4" /> Opret ansøgningstype</button>
        </div>
      </form>
    </div>
  );
}

function ApiKeyBox() {
  const [show, setShow] = useState(false);
  const { data } = useQuery({
    queryKey: ["staff-fivem-key"],
    queryFn: async () => (await supabase.from("fivem_app_keys").select("api_key").limit(1).maybeSingle()).data,
  });
  if (!data) return null;
  const url = typeof window !== "undefined" ? `${window.location.origin}/api/public/fivem-app` : "";
  return (
    <div className="engraved mt-6 rounded-sm bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Forbindelse til FiveM (kun admin)</h3>
      <p className="mt-2 text-sm text-muted-foreground">Indsæt adresse og nøgle i <code>config.lua</code> i FiveM-scriptet. Del aldrig nøglen.</p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div><dt className="text-muted-foreground">Adresse</dt><dd className="break-all font-mono">{url}</dd></div>
        <div>
          <dt className="text-muted-foreground">Nøgle</dt>
          <dd className="flex flex-wrap items-center gap-2 font-mono">
            <span className="break-all">{show ? data.api_key : "••••••••••••••••••••"}</span>
            <button onClick={() => setShow(!show)} className="btn-ghost !min-h-8 !px-2" aria-label="Vis nøgle">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            <button onClick={() => navigator.clipboard.writeText(data.api_key)} className="btn-ghost !min-h-8 !px-2" aria-label="Kopiér nøgle"><Copy className="h-4 w-4" /></button>
          </dd>
        </div>
      </dl>
    </div>
  );
}
