import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Copy } from "lucide-react";
import { summarizeApplicationText } from "@/lib/applications.functions";

export function AiSummaryPanel() {
  const summarize = useServerFn(summarizeApplicationText);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true); setError(""); setSummary("");
    try {
      const r = await summarize({ data: { text } });
      setSummary(r.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noget gik galt");
    } finally { setBusy(false); }
  }

  return (
    <section className="engraved mt-16 rounded-sm bg-card/60 p-6">
      <p className="eyebrow">AI-assistent</p>
      <h2 className="mt-2 font-display text-3xl font-bold">Opsummér en ansøgning</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Indsæt svarene fra en ansøgning. AI'en laver en kort opsummering og fremhæver styrker, opmærksomhedspunkter og forslag til spørgsmål. Beslutningen er stadig jeres.
      </p>
      <textarea
        value={text} onChange={(e) => setText(e.target.value)} maxLength={20000} rows={8}
        placeholder="Indsæt ansøgningens spørgsmål og svar her…"
        aria-label="Ansøgningens svar"
        className="mt-4 w-full rounded-sm border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={run} disabled={busy || text.trim().length < 20} className="btn-primary disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> {busy ? "Analyserer…" : "Opsummér med AI"}
        </button>
        {text && !busy && <button onClick={() => { setText(""); setSummary(""); setError(""); }} className="btn-ghost">Ryd</button>}
        <span className="text-xs text-muted-foreground">{text.length} / 20000</span>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-primary-glow">{error}</p>}
      {summary && (
        <div className="mt-6 rounded-sm border border-border bg-background/60 p-5">
          <div className="flex justify-end">
            <button onClick={() => navigator.clipboard.writeText(summary)} className="btn-ghost text-xs"><Copy className="h-3.5 w-3.5" /> Kopiér</button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {summary.split("\n").map((line, i) =>
              line.startsWith("## ")
                ? <h3 key={i} className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-glow first:mt-0">{line.slice(3)}</h3>
                : <p key={i}>{line.replace(/\*\*/g, "")}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
