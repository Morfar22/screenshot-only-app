import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminHead, AdminTitle } from "./route";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: adminHead("Oversigt"),
  component: Overview,
});

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const count = (t: "whitelist_applications" | "ingame_applications", status?: string) => {
        let q = supabase.from(t).select("id", { count: "exact", head: true });
        if (status) q = q.eq("status", status);
        return q.then((r) => r.count ?? 0);
      };
      const [wlPending, igPending, wlTotal, igTotal, types, status, log] = await Promise.all([
        count("whitelist_applications", "afventer"), count("ingame_applications", "afventer"),
        count("whitelist_applications"), count("ingame_applications"),
        supabase.from("application_types").select("id", { count: "exact", head: true }).eq("is_open", true).then((r) => r.count ?? 0),
        supabase.from("server_status").select("status,players,max_players").order("updated_at", { ascending: false }).limit(1).maybeSingle().then((r) => r.data),
        supabase.from("activity_log").select("id,actor_email,action,target,created_at").order("created_at", { ascending: false }).limit(8).then((r) => r.data ?? []),
      ]);
      return { wlPending, igPending, wlTotal, igTotal, types, status, log };
    },
  });
  const cards = [
    { label: "Whitelist afventer", value: data?.wlPending, to: "/admin/whitelist" as const, hot: (data?.wlPending ?? 0) > 0 },
    { label: "Ansøgninger afventer", value: data?.igPending, to: "/admin/ansogninger" as const, hot: (data?.igPending ?? 0) > 0 },
    { label: "Server", value: data?.status ? `${data.status.status}${data.status.players != null ? ` · ${data.status.players}/${data.status.max_players}` : ""}` : "—", to: "/admin/status" as const },
    { label: "Åbne ansøgningstyper", value: data?.types, to: "/admin/ansogninger" as const },
    { label: "Whitelist i alt", value: data?.wlTotal, to: "/admin/whitelist" as const },
    { label: "Ansøgninger i alt", value: data?.igTotal, to: "/admin/ansogninger" as const },
  ];
  return (
    <>
      <AdminTitle eyebrow="Admin-panel" title="Oversigt">Status på serveren og det, der venter på jer.</AdminTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={`engraved rounded-sm bg-card p-5 hover:bg-card/70 ${c.hot ? "border-l-2 border-primary" : ""}`}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold capitalize">{c.value ?? "…"}</p>
          </Link>
        ))}
      </div>
      <div className="engraved mt-8 rounded-sm bg-card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Seneste aktivitet</h2>
          <Link to="/admin/log" className="text-sm text-muted-foreground underline underline-offset-4">Se alt</Link>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {(data?.log ?? []).map((l) => (
            <li key={l.id} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2">
              <span><span className="text-foreground">{l.actor_email || "System"}</span> <span className="text-muted-foreground">{l.action.toLowerCase()}</span> {l.target}</span>
              <span className="text-muted-foreground">{new Date(l.created_at).toLocaleString("da-DK")}</span>
            </li>
          ))}
          {data && data.log.length === 0 && <li className="text-muted-foreground">Ingen aktivitet endnu.</li>}
        </ul>
      </div>
    </>
  );
}
