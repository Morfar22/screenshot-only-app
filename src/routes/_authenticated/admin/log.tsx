import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminHead, AdminTitle } from "./route";

export const Route = createFileRoute("/_authenticated/admin/log")({
  head: adminHead("Aktivitetslog"),
  component: Log,
});

function Log() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
  const s = q.trim().toLowerCase();
  const rows = (data ?? []).filter((r) => !s || `${r.actor_email} ${r.action} ${r.target}`.toLowerCase().includes(s));
  return (
    <>
      <AdminTitle eyebrow="Sikkerhed" title="Aktivitetslog">Hvem gjorde hvad og hvornår. De seneste 500 handlinger.</AdminTitle>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Søg på person, handling eller navn…" aria-label="Søg i aktivitetsloggen"
        className="w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none" />
      <div className="engraved mt-6 overflow-x-auto rounded-sm bg-card">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Tidspunkt</th><th className="p-3">Person</th><th className="p-3">Handling</th><th className="p-3">Emne</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="whitespace-nowrap p-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("da-DK")}</td>
                <td className="p-3">{r.actor_email || "System"}</td>
                <td className="p-3">{r.action}</td>
                <td className="p-3 text-muted-foreground">{r.target}</td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && <tr><td colSpan={4} className="p-3 text-muted-foreground">Ingen aktivitet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
