import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff-login — Nordisk RP" },
      { name: "description", content: "Log ind som staff på Nordisk RP." },
      { property: "og:title", content: "Staff-login — Nordisk RP" },
      { property: "og:description", content: "Adgang for Nordisk RP's staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field = "mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/staff" });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) navigate({ to: "/staff" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    if (!email || password.length < 8) return setMsg("Skriv email og en adgangskode på mindst 8 tegn.");
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg("Forkert email eller adgangskode.");
  }

  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-md px-5">
          <span className="eyebrow">Kun for staff</span>
          <h1 className="mt-4 text-5xl font-extrabold uppercase">Log ind</h1>
          <p className="mt-4 text-muted-foreground">Adgang til behandling af ansøgninger for godkendte staff-medlemmer.</p>
          <div className="engraved mt-10 space-y-5 rounded-sm bg-card p-8">
            <button
              type="button"
              className="btn-ghost w-full justify-center"
              onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` })}
            >
              Fortsæt med Google
            </button>
            <div className="text-center text-xs uppercase tracking-widest text-muted-foreground">eller</div>
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block text-sm font-semibold">Email<input name="email" type="email" className={field} /></label>
              <label className="block text-sm font-semibold">Adgangskode<input name="password" type="password" className={field} /></label>
              {msg && <p className="text-sm text-primary-glow">{msg}</p>}
              <button type="submit" disabled={busy} className="btn-primary w-full justify-center">{busy ? "Logger ind…" : "Log ind"}</button>
            </form>
            <p className="text-center text-xs text-muted-foreground">Nye staff-konti oprettes af ledelsen.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
