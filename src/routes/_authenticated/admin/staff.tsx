import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus, Trash2, Bell } from "lucide-react";
import { listStaff, setStaffRole, getPingRole, setPingRole } from "@/lib/admin.functions";
import { adminHead, AdminTitle, useAccess } from "./route";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  head: adminHead("Staff"),
  component: StaffPage,
});

function PingRoleBox() {
  const qc = useQueryClient();
  const get = useServerFn(getPingRole);
  const set = useServerFn(setPingRole);
  const { data } = useQuery({ queryKey: ["ping-role"], queryFn: () => get() });
  const [roleId, setRoleId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const value = roleId ?? data?.roleId ?? "";

  async function save() {
    setMsg("");
    try {
      await set({ data: { roleId: value.trim() } });
      setMsg(value.trim() ? "Rollen pinges nu ved nye ansøgninger." : "Ping er slået fra.");
      qc.invalidateQueries({ queryKey: ["ping-role"] });
    } catch (err) { setMsg(err instanceof Error ? err.message : "Fejl"); }
  }

  const input = "w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none";
  return (
    <div className="engraved mt-8 rounded-sm bg-card p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Bell className="h-4 w-4 text-primary-glow" /> Ping ved nye ansøgninger</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Skriv ID'et på den Discord-rolle, der skal pinges i staff-kanalen, når der kommer en ny ansøgning. Lad feltet være tomt for at slå ping fra.
        Rollens ID finder du i Discord under Serverindstillinger → Roller → højreklik på rollen → Kopier rolle-ID (kræver udviklertilstand).
      </p>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input value={value} onChange={(e) => setRoleId(e.target.value)} placeholder="Rolle-ID, fx 123456789012345678" aria-label="Discord rolle-ID" className={input} />
        <button className="btn-primary">Gem</button>
      </form>
      {msg && <p role="status" className="mt-3 text-sm text-primary-glow">{msg}</p>}
    </div>
  );
}

function StaffPage() {
  const access = useAccess();
  const qc = useQueryClient();
  const list = useServerFn(listStaff);
  const setRole = useServerFn(setStaffRole);
  const { data } = useQuery({ queryKey: ["staff-list"], queryFn: () => list(), enabled: !!access.data?.isAdmin });
  const [email, setEmail] = useState("");
  const [role, setR] = useState<"staff" | "admin">("staff");
  const [msg, setMsg] = useState("");

  async function change(e: string, r: "staff" | "admin", grant: boolean) {
    setMsg("");
    try {
      await setRole({ data: { email: e, role: r, grant } });
      setMsg(grant ? `${e} har fået ${r}-adgang.` : `${r}-adgang fjernet fra ${e}.`);
      if (grant) setEmail("");
    } catch (err) { setMsg(err instanceof Error ? err.message : "Fejl"); }
    qc.invalidateQueries({ queryKey: ["staff-list"] });
  }

  if (!access.data?.isAdmin) return <p className="text-muted-foreground">Kun admins kan styre staff.</p>;
  const input = "w-full rounded-sm border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary-glow focus:outline-none";
  return (
    <>
      <AdminTitle eyebrow="Adgang" title="Staff">Staff kan behandle ansøgninger og status. Admins kan også styre staff og se FiveM-nøglen.</AdminTitle>
      <form onSubmit={(e) => { e.preventDefault(); change(email, role, true); }} className="engraved grid gap-3 rounded-sm bg-card p-6 sm:grid-cols-[1fr_150px_auto]">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email på personen" aria-label="Email" className={input} />
        <select value={role} onChange={(e) => setR(e.target.value as "staff" | "admin")} aria-label="Rolle" className={input}>
          <option value="staff">Staff</option><option value="admin">Admin</option>
        </select>
        <button className="btn-primary"><UserPlus className="h-4 w-4" /> Giv adgang</button>
        <p className="text-xs text-muted-foreground sm:col-span-3">Personen skal have logget ind på siden én gang (fx med Google), før de kan få adgang.</p>
      </form>
      {msg && <p role="status" className="mt-4 text-sm text-primary-glow">{msg}</p>}
      <ul className="mt-6 space-y-3">
        {(data?.staff ?? []).map((s) => (
          <li key={s.userId} className="engraved flex flex-wrap items-center justify-between gap-3 rounded-sm bg-card p-4">
            <div>
              <p className="font-semibold">{s.email}{s.userId === data?.me && <span className="text-muted-foreground"> (dig)</span>}</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.roles.join(" · ")}</p>
            </div>
            <div className="flex gap-2">
              {s.roles.map((r) => (s.userId === data?.me && r === "admin") ? null : (
                <button key={r} onClick={() => confirm(`Fjern ${r}-adgang fra ${s.email}?`) && change(s.email, r as "staff" | "admin", false)} className="btn-ghost text-destructive !min-h-9 !px-3">
                  <Trash2 className="h-4 w-4" /> Fjern {r}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
