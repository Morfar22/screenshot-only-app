import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

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
            <button onClick={logout} className="btn-ghost">Log ud</button>
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
              <div className="mt-10 flex gap-2">
                {tabs.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`rounded-sm border px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
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
                      {a.status !== "godkendt" && <button onClick={() => setStatus(a.id, "godkendt")} className="btn-primary">Godkend</button>}
                      {a.status !== "afvist" && <button onClick={() => setStatus(a.id, "afvist")} className="btn-ghost">Afvis</button>}
                      {a.status !== "afventer" && <button onClick={() => setStatus(a.id, "afventer")} className="btn-ghost">Sæt til afventer</button>}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
