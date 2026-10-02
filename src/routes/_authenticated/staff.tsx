import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, X, RotateCcw, LogOut, Trash2, Plus } from "lucide-react";
import { PageShell } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { IngamePanel } from "@/components/staff-ingame";

export const Route = createFileRoute("/_authenticated/staff")({
  head: () => ({
    meta: [
      { title: "Ansøgninger — Nordisk RP staff" },
      { name: "description", content: "Behandl whitelist-ansøgninger til Nordisk RP." },
      { property: "og:title", content: "Ansøgninger — Nordisk RP staff" },
      { property: "og:description", content: "Staff-oversigt over ansøgninger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Staff,
});

type Status = "afventer" | "godkendt" | "afvist";
const tabs: Status[] = ["afventer", "godkendt", "afvist"];

function Staff() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Status>("afventer");
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["staff-data"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user?.id ?? "");
      const isStaff = (roles ?? []).length > 0;
      if (!isStaff) return { isStaff, email: u.user?.email ?? "", apps: [] };
      const { data: apps, error } = await supabase.from("whitelist_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return { isStaff, email: u.user?.email ?? "", apps: apps ?? [] };
    },
  });

  async function setStatus(id: string, status: Status) {
    await supabase.from("whitelist_applications").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["staff-data"] });
  }

  async function logout() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }

  const apps = (data?.apps ?? []).filter((a) => a.status === tab);

  return (
    <PageShell>
      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-5xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Staff</span>
              <h1 className="mt-4 text-5xl font-extrabold uppercase">Ansøgninger</h1>
            </div>
            <button onClick={logout} className="btn-ghost"><LogOut className="h-4 w-4" /> Log ud</button>
          </div>

          {isLoading ? (
            <p className="mt-10 text-muted-foreground">Henter…</p>
          ) : !data?.isStaff ? (
            <div className="engraved mt-10 rounded-sm bg-card p-8">
              <h2 className="text-2xl font-bold uppercase">Ingen staff-adgang</h2>
              <p className="mt-3 text-muted-foreground">Du er logget ind som {data?.email}, men kontoen har ikke staff-rettigheder endnu. Bed en admin om at give dig adgang.</p>
            </div>
          ) : (
            <>
              <div className="scrollbar-none mt-10 flex gap-2 overflow-x-auto border-b border-border" role="tablist" aria-label="Ansøgningsstatus">
                {tabs.map((t) => (
                  <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold capitalize ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {t} ({(data.apps ?? []).filter((a) => a.status === t).length})
                  </button>
                ))}
              </div>
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
                    </div>
                  </article>
                ))}
              </div>
              <IngamePanel />
              <StatusPanel />
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

type ServerStatus = "online" | "offline" | "vedligeholdelse";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function StatusPanel() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<ServerStatus>("online");
  const [message, setMessage] = useState("");
  const [statusId, setStatusId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const statusQuery = useQuery({
    queryKey: ["staff-server-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("server_status").select("id,status,message").order("updated_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const maintenanceQuery = useQuery({
    queryKey: ["staff-maintenance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_windows").select("id,title,description,starts_at,ends_at").order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const s = statusQuery.data;
    if (s && statusId === null) {
      setStatusId(s.id);
      setStatus(s.status as ServerStatus);
      setMessage(s.message);
    }
  }, [statusQuery.data, statusId]);

  async function saveStatus() {
    if (!statusId) return;
    await supabase.from("server_status").update({ status, message, updated_at: new Date().toISOString() }).eq("id", statusId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    qc.invalidateQueries({ queryKey: ["staff-server-status"] });
  }

  async function addMaintenance(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startsAt || !endsAt) return;
    await supabase.from("maintenance_windows").insert({
      title,
      description,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    });
    setTitle(""); setDescription(""); setStartsAt(""); setEndsAt("");
    qc.invalidateQueries({ queryKey: ["staff-maintenance"] });
  }

  async function removeMaintenance(id: string) {
    await supabase.from("maintenance_windows").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["staff-maintenance"] });
  }

  const inputCls = "w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none";

  return (
    <section className="mt-16 border-t border-border pt-10" aria-label="Serverstatus">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide">Serverstatus</h2>
        <Link to="/status" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Se den offentlige statusside</Link>
      </div>

      <div className="engraved mt-6 rounded-sm bg-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Aktuel status</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <select value={status} onChange={(e) => setStatus(e.target.value as ServerStatus)} className={inputCls} aria-label="Status">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="vedligeholdelse">Vedligeholdelse</option>
          </select>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Besked til besøgende (fx 'Genstart kl. 22')" className={inputCls} aria-label="Statusbesked" maxLength={300} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveStatus} className="btn-primary" disabled={!statusId}><Check className="h-4 w-4" /> Gem status</button>
          {saved && <span className="text-sm text-green-500">Gemt — synlig på statussiden nu.</span>}
        </div>
      </div>

      <div className="engraved mt-6 rounded-sm bg-card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-glow">Planlagt vedligeholdelse</h3>
        <form onSubmit={addMaintenance} className="mt-4 grid gap-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titel (fx 'Opdatering af jobs')" className={inputCls} required maxLength={120} aria-label="Titel" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beskrivelse (valgfri)" className={`${inputCls} min-h-20`} maxLength={1000} aria-label="Beskrivelse" />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm text-muted-foreground">Starter
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls} required />
            </label>
            <label className="grid gap-1 text-sm text-muted-foreground">Slutter
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={inputCls} required />
            </label>
          </div>
          <div><button type="submit" className="btn-primary"><Plus className="h-4 w-4" /> Tilføj</button></div>
        </form>
        <ul className="mt-6 space-y-3">
          {(maintenanceQuery.data ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(m.starts_at).toLocaleString("da-DK")} – {new Date(m.ends_at).toLocaleString("da-DK")}</p>
              </div>
              <button onClick={() => removeMaintenance(m.id)} className="btn-ghost !min-h-9 !px-3" aria-label={`Slet ${m.title}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          {(maintenanceQuery.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">Ingen planlagt vedligeholdelse.</li>}
        </ul>
      </div>
    </section>
  );
}
