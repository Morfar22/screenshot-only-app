import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { PageShell } from "@/components/site";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, LogOut, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { submitWebApplication } from "@/lib/applications.functions";

export const Route = createFileRoute("/ansogninger")({
  head: () => ({
    meta: [
      { title: "Ansøgninger — Nordisk RP" },
      { name: "description", content: "Ansøg om staff, whitelist, bande og meget mere — og følg status på dine ansøgninger." },
      { property: "og:title", content: "Ansøgninger — Nordisk RP" },
      { property: "og:description", content: "Alle ansøgningstyper samlet ét sted. Ansøg og følg din status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Applications,
});

type Question = { label: string; required?: boolean; long?: boolean };
type AppType = { id: string; title: string; description: string; questions: Question[] };

const field = "mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary";

function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, ready };
}

function Applications() {
  const { user, ready } = useUser();
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
            Ansøg her på siden eller direkte i spillet via laptoppen. Log ind med Discord for at sende og følge dine ansøgninger.
          </p>

          {ready && (user ? <MyApplications user={user} /> : <LoginBox />)}

          {selected && user ? (
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
                  onClick={() => (user ? setSelected(t) : document.getElementById("login-box")?.scrollIntoView({ behavior: "smooth" }))}
                  className="engraved group rounded-sm bg-card p-6 text-left transition-colors hover:border-primary-glow"
                >
                  <h2 className="text-xl font-bold uppercase tracking-wide">{t.title}</h2>
                  {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-glow">
                    {user ? "Ansøg nu" : "Log ind for at ansøge"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

function LoginBox() {
  const [err, setErr] = useState("");
  async function discord() {
    setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/ansogninger` },
    });
    if (error) setErr("Discord-login er ikke klar endnu. Brug Google i mellemtiden.");
  }
  async function google() {
    setErr("");
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/ansogninger` });
    if (r.error) setErr("Login mislykkedes. Prøv igen.");
  }
  return (
    <div id="login-box" className="engraved mt-10 rounded-sm bg-card p-6">
      <h2 className="text-xl font-bold uppercase">Log ind for at ansøge</h2>
      <p className="mt-2 text-sm text-muted-foreground">Så kan du se status på dine ansøgninger og få besked på Discord.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={discord} className="btn-primary">Log ind med Discord</button>
        <button onClick={google} className="btn-ghost">Fortsæt med Google</button>
      </div>
      {err && <p className="mt-3 text-sm text-primary-glow">{err}</p>}
    </div>
  );
}

const STATUS: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  afventer: { label: "Afventer", icon: Clock, cls: "text-muted-foreground" },
  godkendt: { label: "Godkendt", icon: CheckCircle2, cls: "text-foreground" },
  afvist: { label: "Afvist", icon: XCircle, cls: "text-primary-glow" },
};

function MyApplications({ user }: { user: User }) {
  const { data } = useQuery({
    queryKey: ["my-applications", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingame_applications")
        .select("id,status,staff_note,created_at,application_types(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const name = (user.user_metadata?.["full_name"] as string) || (user.user_metadata?.["name"] as string) || user.email;
  return (
    <div className="engraved mt-10 rounded-sm bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold uppercase">Mine ansøgninger</h2>
        <button onClick={() => supabase.auth.signOut()} className="btn-ghost !min-h-9 !px-3 text-sm"><LogOut className="h-4 w-4" /> Log ud</button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Logget ind som {name}</p>
      {(data ?? []).length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Du har ikke sendt nogen ansøgninger endnu.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {(data ?? []).map((a) => {
            const s = STATUS[a.status] ?? STATUS["afventer"]!;
            const Icon = s.icon;
            return (
              <li key={a.id} className="py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">{(a.application_types as { title: string } | null)?.title ?? "Ansøgning"}</span>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${s.cls}`}><Icon className="h-4 w-4" /> {s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">Sendt {new Date(a.created_at).toLocaleDateString("da-DK")}</p>
                {a.staff_note && <p className="mt-1 text-sm text-muted-foreground">Besked fra staff: {a.staff_note}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ApplyForm({ type, onBack }: { type: AppType; onBack: () => void }) {
  const qc = useQueryClient();
  const submit = useServerFn(submitWebApplication);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const q of type.questions) {
      if (q.required && !(answers[q.label] ?? "").trim()) {
        setErrorMsg(`Besvar: ${q.label}`);
        return;
      }
    }
    setErrorMsg("");
    setState("sending");
    try {
      await submit({ data: { typeId: type.id, answers: type.questions.map((q) => ({ question: q.label, answer: (answers[q.label] ?? "").trim() })) } });
      setState("done");
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error && err.message ? err.message : "Noget gik galt. Prøv igen om lidt.");
    }
  }

  if (state === "done") {
    return (
      <div className="engraved mt-10 rounded-sm bg-card p-8">
        <CheckCircle2 className="h-8 w-8 text-primary-glow" />
        <h2 className="mt-5 text-2xl font-bold uppercase">Ansøgningen er sendt</h2>
        <p className="mt-3 text-muted-foreground">
          Din ansøgning til <span className="text-foreground">{type.title}</span> er sendt til staff. Du kan følge status under "Mine ansøgninger".
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
      {type.questions.map((q) => (
        <label key={q.label} className="block text-sm font-semibold">
          {q.label} {q.required ? <span className="text-primary-glow">*</span> : <span className="font-normal text-muted-foreground">(valgfrit)</span>}
          {q.long ? (
            <textarea rows={5} maxLength={4000} value={answers[q.label] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.label]: e.target.value }))} className={field} />
          ) : (
            <input maxLength={4000} value={answers[q.label] ?? ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.label]: e.target.value }))} className={field} />
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
