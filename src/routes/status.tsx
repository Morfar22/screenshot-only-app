import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site";
import { Activity, CheckCircle2, Wrench, XCircle, CalendarClock, Users } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Serverstatus — Nordisk RP" },
      { name: "description", content: "Se Nordisk RP-serverens aktuelle status og planlagt vedligeholdelse." },
      { property: "og:title", content: "Serverstatus — Nordisk RP" },
      { property: "og:description", content: "Aktuel status og planlagt vedligeholdelse på Nordisk RP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

type StatusRow = { status: "online" | "offline" | "vedligeholdelse"; message: string; updated_at: string; players: number | null; max_players: number | null };
type MaintenanceRow = { id: string; title: string; description: string; starts_at: string; ends_at: string };

const STATUS_META = {
  online: { label: "Online", text: "Serveren kører normalt", Icon: CheckCircle2, cls: "text-green-500 border-green-500/40" },
  offline: { label: "Offline", text: "Serveren er i øjeblikket nede", Icon: XCircle, cls: "text-primary-glow border-primary-glow/40" },
  vedligeholdelse: { label: "Vedligeholdelse", text: "Der arbejdes på serveren", Icon: Wrench, cls: "text-yellow-500 border-yellow-500/40" },
} as const;

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

function StatusPage() {
  const qc = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ["server-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("server_status").select("status,message,updated_at,players,max_players").order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data as StatusRow | null;
    },
    refetchInterval: 60_000,
  });

  // Ping FiveM-serveren direkte, så status altid er frisk, når nogen kigger forbi.
  useEffect(() => {
    const check = () =>
      fetch("/api/public/fivem-status")
        .catch(() => {})
        .finally(() => qc.invalidateQueries({ queryKey: ["server-status"] }));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [qc]);
  const maintenanceQuery = useQuery({
    queryKey: ["maintenance-windows"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_windows").select("id,title,description,starts_at,ends_at").gte("ends_at", new Date().toISOString()).order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MaintenanceRow[];
    },
    refetchInterval: 60_000,
  });

  const current = statusQuery.data;
  const meta = current ? STATUS_META[current.status] : null;

  return (
    <PageShell>
      <section className="rune-ring border-b border-border pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="eyebrow">Status</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase tracking-wide sm:text-6xl">Serverstatus</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Her kan du altid se, om serveren er oppe, og om der er planlagt vedligeholdelse på vej.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        {statusQuery.isLoading ? (
          <p className="text-muted-foreground">Henter status…</p>
        ) : statusQuery.isError || !current || !meta ? (
          <div className="engraved rounded-sm p-8">
            <p className="text-muted-foreground">Status kunne ikke hentes lige nu. Prøv igen om et øjeblik, eller spørg på Discord.</p>
          </div>
        ) : (
          <div className={`engraved rounded-sm border-l-4 p-8 ${meta.cls}`}>
            <div className="flex flex-wrap items-center gap-4">
              <meta.Icon className="h-10 w-10" aria-hidden />
              <div>
                <p className="font-display text-3xl font-bold uppercase tracking-wide">{meta.label}</p>
                <p className="text-muted-foreground">{meta.text}</p>
              </div>
            </div>
            {current.message && <p className="mt-5 border-t border-border pt-5 text-muted-foreground">{current.message}</p>}
            <p className="mt-4 text-xs text-muted-foreground">Opdateret {formatWhen(current.updated_at)}</p>
          </div>
        )}

        <div className="mt-16">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-primary-glow" aria-hidden />
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Planlagt vedligeholdelse</h2>
          </div>
          {maintenanceQuery.isLoading ? (
            <p className="mt-6 text-muted-foreground">Henter planlagt vedligeholdelse…</p>
          ) : (maintenanceQuery.data ?? []).length === 0 ? (
            <p className="mt-6 text-muted-foreground">Ingen planlagt vedligeholdelse lige nu.</p>
          ) : (
            <ul className="mt-6 grid gap-4">
              {(maintenanceQuery.data ?? []).map((m) => (
                <li key={m.id} className="engraved rounded-sm p-6">
                  <p className="font-display text-xl font-bold uppercase tracking-wide">{m.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatWhen(m.starts_at)} – {formatWhen(m.ends_at)}
                  </p>
                  {m.description && <p className="mt-3 text-muted-foreground">{m.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-16 flex items-center gap-3 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" aria-hidden />
          <p>Siden opdaterer sig selv hvert minut.</p>
        </div>
      </section>
    </PageShell>
  );
}
