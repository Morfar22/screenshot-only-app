import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/site";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/ansogninger")({
  head: () => ({
    meta: [
      { title: "Ansøgninger — Nordisk RP" },
      { name: "description", content: "Ansøg om staff, whitelist, bande og meget mere — direkte på hjemmesiden eller i spillet." },
      { property: "og:title", content: "Ansøgninger — Nordisk RP" },
      { property: "og:description", content: "Alle ansøgningstyper samlet ét sted. Ansøg på hjemmesiden eller i spillet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Applications,
});

type Question = { label: string; required?: boolean; long?: boolean };
type AppType = { id: string; title: string; description: string; questions: Question[] };

const field = "mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary";

function Applications() {
  const [selected, setSelected] = useState<AppType | null>(null);
  const { data: types, isLoading } = useQuery({
    queryKey: ["public-app-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_types")
        .select("id,title,description,questions")
        .eq("is_open", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AppType[];
    },
  });

  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-3xl px-5">
          <span className="eyebrow">Ansøgninger</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Søg din plads i byen</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Alle ansøgninger kan sendes her på siden — eller direkte i spillet via laptoppen. Staff behandler dem samme sted, uanset hvor de kommer fra.
          </p>
          {selected ? (
            <ApplyForm type={selected} onBack={() => setSelected(null)} />
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {isLoading && <p className="text-muted-foreground">Henter ansøgninger…</p>}
              {!isLoading && (types ?? []).length === 0 && (
                <p className="text-muted-foreground">Ingen åbne ansøgninger lige nu. Følg med på Discord.</p>
              )}
              {(types ?? []).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="engraved group rounded-sm bg-card p-6 text-left transition-colors hover:border-primary-glow"
                >
                  <h2 className="text-xl font-bold uppercase tracking-wide">{t.title}</h2>
                  {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-glow">
                    Ansøg nu <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function ApplyForm({ type, onBack }: { type: AppType; onBack: () => void }) {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setErrorMsg("Skriv dit navn eller Discord-navn.");
      return;
    }
    for (const q of type.questions) {
      if (q.required && !(answers[q.label] ?? "").trim()) {
        setErrorMsg(`Besvar: ${q.label}`);
        return;
      }
    }
    setErrorMsg("");
    setState("sending");
    const { error } = await supabase.from("ingame_applications").insert({
      type_id: type.id,
      fivem_identifier: `web:${trimmed.toLowerCase()}`,
      player_name: trimmed,
      answers: type.questions.map((q) => ({ question: q.label, answer: (answers[q.label] ?? "").trim() })),
      source: "web",
    });
    if (error) {
      setState("error");
      setErrorMsg("Noget gik galt. Prøv igen om lidt — eller ansøg i spillet i stedet.");
    } else {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <div className="engraved mt-10 rounded-sm bg-card p-8">
        <CheckCircle2 className="h-8 w-8 text-primary-glow" />
        <h2 className="mt-5 text-2xl font-bold uppercase">Ansøgningen er sendt</h2>
        <p className="mt-3 text-muted-foreground">
          Din ansøgning til <span className="text-foreground">{type.title}</span> er sendt til staff. Du får besked på Discord.
        </p>
        <button onClick={onBack} className="btn-ghost mt-6"><ArrowLeft className="h-4 w-4" /> Tilbage til oversigten</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="engraved mt-10 space-y-6 rounded-sm bg-card p-8" noValidate>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold uppercase">{type.title}</h2>
          {type.description && <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>}
        </div>
        <button type="button" onClick={onBack} className="btn-ghost !min-h-9 !px-3" aria-label="Tilbage"><ArrowLeft className="h-4 w-4" /></button>
      </div>
      <label className="block text-sm font-semibold">
        Dit navn eller Discord-navn
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={field} />
      </label>
      {type.questions.map((q) => (
        <label key={q.label} className="block text-sm font-semibold">
          {q.label} {q.required ? <span className="text-primary-glow">*</span> : <span className="font-normal text-muted-foreground">(valgfrit)</span>}
          {q.long ? (
            <textarea
              rows={5}
              maxLength={4000}
              value={answers[q.label] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.label]: e.target.value }))}
              className={field}
            />
          ) : (
            <input
              maxLength={4000}
              value={answers[q.label] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.label]: e.target.value }))}
              className={field}
            />
          )}
        </label>
      ))}
      {errorMsg && <p className="text-sm text-primary-glow">{errorMsg}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary">
        <Send className="h-4 w-4" /> {state === "sending" ? "Sender…" : "Send ansøgning"}
      </button>
    </form>
  );
}
