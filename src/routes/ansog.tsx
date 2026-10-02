import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PageShell, DISCORD_URL } from "@/components/site";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

function Apply() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const { error } = await supabase.from("whitelist_applications").insert({ ...parsed.data, rp_experience: parsed.data.rp_experience ?? null });
    setState(error ? "error" : "done");
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-sm text-primary-glow">{errors[k]}</p> : null);

  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-2xl px-5">
          <span className="eyebrow">Adgang til byen</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase sm:text-6xl">Din historie starter her</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">Vi leder ikke efter den mest magtfulde karakter. Vi leder efter mennesker, der vil skabe godt rollespil sammen med andre.</p>
          {state === "done" ? (
            <div className="engraved mt-10 rounded-sm bg-card p-8">
              <CheckCircle2 className="h-8 w-8 text-primary-glow" />
              <h2 className="mt-5 text-2xl font-bold uppercase">Ansøgningen er sendt</h2>
              <p className="mt-3 text-muted-foreground">Staff gennemgår den hurtigst muligt. Du får besked på Discord.</p>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="btn-primary mt-6">Gå til Discord <ArrowRight className="h-4 w-4" /></a>
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
