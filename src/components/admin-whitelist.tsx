import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, X, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { setWhitelistStatus } from "@/lib/applications.functions";
import { deleteApplication } from "@/lib/admin.functions";

type Status = "afventer" | "godkendt" | "afvist";
const tabs: Status[] = ["afventer", "godkendt", "afvist"];

export function WhitelistPanel() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("afventer");
  const [query, setQuery] = useState("");
  const { data: rows, isLoading } = useQuery({
    queryKey: ["staff-data"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whitelist_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const data = { apps: rows ?? [] };
  const updateStatus = useServerFn(setWhitelistStatus);
  const del = useServerFn(deleteApplication);
  async function setStatus(id: string, status: Status) {
    await updateStatus({ data: { id, status } });
    qc.invalidateQueries({ queryKey: ["staff-data"] });
  }
  async function deleteApp(id: string, name: string) {
    if (!window.confirm(`Slet ansøgningen fra ${name}? Det kan ikke fortrydes.`)) return;
    await del({ data: { id, kind: "whitelist", name } });
    qc.invalidateQueries({ queryKey: ["staff-data"] });
  }
  const q = query.trim().toLowerCase();
  const apps = (data?.apps ?? []).filter(
    (a) =>
      a.status === tab &&
      (!q ||
        a.character_name.toLowerCase().includes(q) ||
        a.discord_name.toLowerCase().includes(q) ||
        a.backstory.toLowerCase().includes(q) ||
        (a.rp_experience ?? "").toLowerCase().includes(q)),
  );
  if (isLoading) return <p className="mt-6 text-muted-foreground">Henter…</p>;
  return (
    <>
              <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto border-b border-border" role="tablist" aria-label="Ansøgningsstatus">
                {tabs.map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold capitalize ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {t} ({(data.apps ?? []).filter((a) => a.status === t).length})
                  </button>
                ))}
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søg på karakter, Discord-navn eller tekst…"
                aria-label="Søg i whitelist-ansøgninger"
                className="mt-4 w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none"
              />
              <div className="mt-6 space-y-4">
                {apps.length === 0 && <p className="text-muted-foreground">Ingen ansøgninger her.</p>}
                {apps.map((a) => (
                  <article key={a.id} className="engraved rounded-sm bg-card p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h2 className="text-2xl font-bold">{a.character_name}</h2>
                      <span className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString("da-DK")}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Discord: <span className="text-foreground">{a.discord_name}</span> · Alder: <span className="text-foreground">{a.age}</span></p>
                    <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-glow">Baggrundshistorie</h3>
                    <p className="mt-1 whitespace-pre-wrap text-foreground/90">{a.backstory}</p>
                    {a.rp_experience && (
                      <>
                        <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-primary-glow">Erfaring</h3>
                        <p className="mt-1 whitespace-pre-wrap text-foreground/90">{a.rp_experience}</p>
                      </>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {a.status !== "godkendt" && <button onClick={() => setStatus(a.id, "godkendt")} className="btn-primary"><Check className="h-4 w-4" /> Godkend</button>}
                      {a.status !== "afvist" && <button onClick={() => setStatus(a.id, "afvist")} className="btn-ghost"><X className="h-4 w-4" /> Afvis</button>}
                      {a.status !== "afventer" && <button onClick={() => setStatus(a.id, "afventer")} className="btn-ghost"><RotateCcw className="h-4 w-4" /> Sæt til afventer</button>}
                      <button onClick={() => deleteApp(a.id, a.character_name)} className="btn-ghost text-destructive"><Trash2 className="h-4 w-4" /> Slet</button>
                    </div>
                  </article>
                ))}
              </div>
    </>
  );
}
