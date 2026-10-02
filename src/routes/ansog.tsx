import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageShell, DISCORD_URL } from "@/components/site";
import { ArrowRight, CheckCircle2, Clock, XCircle, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { submitWhitelistApplication } from "@/lib/applications.functions";

export const Route = createFileRoute("/ansog")({
  head: () => ({
    meta: [
      { title: "Ansøg om adgang — Nordisk RP" },
      { name: "description", content: "Send din whitelist-ansøgning til Nordisk RP direkte på siden." },
      { property: "og:title", content: "Ansøg om adgang — Nordisk RP" },
      { property: "og:description", content: "Fortæl os om dig selv og din karakteridé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Apply,
});

const schema = z.object({
  discord_name: z.string().trim().min(2, "Skriv dit Discord-navn").max(64),
  age: z.coerce.number().int().min(13, "Ugyldig alder").max(99, "Ugyldig alder"),
  character_name: z.string().trim().min(2, "Skriv karakterens navn").max(80),
  backstory: z.string().trim().min(50, "Mindst 50 tegn").max(4000),
  rp_experience: z.string().trim().max(2000).optional(),
  read_rules: z.literal(true, { errorMap: () => ({ message: "Du skal have læst reglerne" }) }),
});

const field = "mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary";

type Existing = { id: string; status: string; character_name: string; created_at: string };

function Apply() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<Existing | null>(null);
  const [reapply, setReapply] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: rows } = await supabase
          .from("whitelist_applications")
          .select("id, status, character_name, created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(1);
        if (active && rows && rows.length > 0) setExisting(rows[0] as Existing);
      }
      if (active) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!active) return;
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;
    const f = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      discord_name: f.get("discord_name"),
      age: f.get("age"),
      character_name: f.get("character_name"),
      backstory: f.get("backstory"),
      rp_experience: f.get("rp_experience") || undefined,
      read_rules: f.get("read_rules") === "on",
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setState("sending");
    try {
      await submit({ data: parsed.data });
      setState("done");
    } catch {
      setState("error");
    }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-sm text-primary-glow">{errors[k]}</p> : null);

  const showForm = !existing || (existing.status === "afvist" && reapply);

  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-2xl px-5">
          <span className="eyebrow">Adgang til byen</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Din historie starter her</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">Vi leder ikke efter den mest magtfulde karakter. Vi leder efter mennesker, der vil skabe godt rollespil sammen med andre.</p>

          {loading ? (
            <p className="mt-10 text-muted-foreground">Henter…</p>
          ) : !userId ? (
            <div className="engraved mt-10 rounded-sm bg-card p-8">
              <LogIn className="h-8 w-8 text-primary-glow" />
              <h2 className="mt-5 text-2xl font-bold uppercase">Log ind for at ansøge</h2>
              <p className="mt-3 text-muted-foreground">Log ind med Google, så vi kan knytte ansøgningen til dig — og så du altid kan se din status her.</p>
              <button
                onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/ansog` })}
                className="btn-primary mt-6"
              >
                Fortsæt med Google <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : state === "done" ? (
            <div className="engraved mt-10 rounded-sm bg-card p-8">
              <CheckCircle2 className="h-8 w-8 text-primary-glow" />
              <h2 className="mt-5 text-2xl font-bold uppercase">Ansøgningen er sendt</h2>
              <p className="mt-3 text-muted-foreground">Staff gennemgår den hurtigst muligt. Du kan altid se din status her på siden.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">Gå til Discord <ArrowRight className="h-4 w-4" /></a>
            </div>
          ) : existing && !showForm ? (
            <div className="engraved mt-10 rounded-sm bg-card p-8">
              {existing.status === "godkendt" ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-primary-glow" />
                  <h2 className="mt-5 text-2xl font-bold uppercase">Du er godkendt</h2>
                  <p className="mt-3 text-muted-foreground">Din ansøgning om <span className="text-foreground">{existing.character_name}</span> er godkendt. Velkommen til byen — vi ses inde på serveren.</p>
                  <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">Gå til Discord <ArrowRight className="h-4 w-4" /></a>
                </>
              ) : existing.status === "afvist" ? (
                <>
                  <XCircle className="h-8 w-8 text-primary-glow" />
                  <h2 className="mt-5 text-2xl font-bold uppercase">Ansøgning afvist</h2>
                  <p className="mt-3 text-muted-foreground">Din ansøgning om <span className="text-foreground">{existing.character_name}</span> blev desværre afvist. Spørg gerne staff på Discord, hvis du vil vide hvorfor.</p>
                  <button onClick={() => setReapply(true)} className="btn-primary mt-6">Send en ny ansøgning <ArrowRight className="h-4 w-4" /></button>
                </>
              ) : (
                <>
                  <Clock className="h-8 w-8 text-primary-glow" />
                  <h2 className="mt-5 text-2xl font-bold uppercase">Din ansøgning afventer</h2>
                  <p className="mt-3 text-muted-foreground">Din ansøgning om <span className="text-foreground">{existing.character_name}</span> er sendt og afventer staff. Du får besked her på siden og på Discord.</p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="engraved mt-10 space-y-6 rounded-sm bg-card p-8" noValidate>
              <p className="text-muted-foreground">Skriv konkret og med dine egne ord. Har du ikke læst <Link to="/regler" className="text-primary-glow underline">reglerne</Link>, så gør det først.</p>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-sm font-semibold">Discord-navn<input name="discord_name" autoComplete="username" className={field} /><Err k="discord_name" /></label>
                <label className="block text-sm font-semibold">Alder<input name="age" type="number" min={13} max={99} inputMode="numeric" className={field} /><Err k="age" /></label>
              </div>
              <label className="block text-sm font-semibold">Karakterens navn<input name="character_name" className={field} /><Err k="character_name" /></label>
              <label className="block text-sm font-semibold">Karakterens baggrundshistorie <span className="font-normal text-muted-foreground">(mindst 50 tegn)</span><textarea name="backstory" rows={6} maxLength={4000} className={field} /><Err k="backstory" /></label>
              <label className="block text-sm font-semibold">Erfaring med rollespil (valgfrit)<textarea name="rp_experience" rows={3} className={field} /></label>
              <label className="flex items-start gap-3 text-sm"><input name="read_rules" type="checkbox" className="mt-1 accent-primary" /> Jeg har læst og accepterer reglerne</label>
              <Err k="read_rules" />
              {state === "error" && <p className="text-sm text-primary-glow">Noget gik galt. Prøv igen om lidt.</p>}
              <button type="submit" disabled={state === "sending"} className="btn-primary">{state === "sending" ? "Sender…" : "Send ansøgning"}</button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
