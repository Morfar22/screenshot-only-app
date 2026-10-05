import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, ScrollText, Gamepad2, Activity, Sparkles, Users, History, LogOut, BookOpen } from "lucide-react";
import { PageShell } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/admin.functions";

const meta = (t: string) => [
  { title: t }, { name: "description", content: "Admin-panel for Nordisk RP's staff." },
  { property: "og:title", content: t }, { property: "og:description", content: "Admin-panel for Nordisk RP." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
];
export const adminHead = (t: string) => () => ({ meta: meta(`${t} — Nordisk RP admin`) });

export const Route = createFileRoute("/_authenticated/admin")({
  head: adminHead("Admin"),
  component: AdminLayout,
});

export function useAccess() {
  const fn = useServerFn(getMyAccess);
  return useQuery({ queryKey: ["my-access"], queryFn: () => fn() });
}

const nav = [
  { to: "/admin", label: "Oversigt", icon: LayoutDashboard, exact: true },
  { to: "/admin/whitelist", label: "Whitelist", icon: ScrollText },
  { to: "/admin/ansogninger", label: "Ansøgninger", icon: Gamepad2 },
  { to: "/admin/regler", label: "Regler", icon: BookOpen },
  { to: "/admin/status", label: "Serverstatus", icon: Activity },
  { to: "/admin/ai", label: "AI-assistent", icon: Sparkles },
  { to: "/admin/log", label: "Aktivitetslog", icon: History },
  { to: "/admin/staff", label: "Staff", icon: Users, admin: true },
] as const;

function AdminLayout() {
  const { data, isLoading } = useAccess();
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function logout() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <PageShell>
      <section className="pb-24 pt-28">
        <div className="mx-auto max-w-7xl px-5">
          {isLoading ? <p className="text-muted-foreground">Henter…</p> : !data?.isStaff ? (
            <div className="engraved mx-auto max-w-xl rounded-sm bg-card p-8">
              <h1 className="text-2xl font-bold uppercase">Ingen staff-adgang</h1>
              <p className="mt-3 text-muted-foreground">Du er logget ind som {data?.email}, men kontoen har ikke adgang. Bed en admin om at give dig adgang.</p>
              <button onClick={logout} className="btn-ghost mt-6"><LogOut className="h-4 w-4" /> Log ud</button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <p className="eyebrow">Admin-panel</p>
                <p className="mt-2 truncate text-xs text-muted-foreground">{data.email} · {data.isAdmin ? "Admin" : "Staff"}</p>
                <nav className="scrollbar-none mt-4 flex gap-1 overflow-x-auto lg:flex-col" aria-label="Admin-menu">
                  {nav.filter((n) => !("admin" in n) || data.isAdmin).map((n) => (
                    <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }}
                      className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
                      activeProps={{ className: "bg-card !text-foreground border-l-2 border-primary" }}>
                      <n.icon className="h-4 w-4" /> {n.label}
                    </Link>
                  ))}
                  <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground lg:mt-4"><LogOut className="h-4 w-4" /> Log ud</button>
                </nav>
              </aside>
              <div className="min-w-0"><Outlet /></div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function AdminTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="mt-3 text-4xl font-extrabold uppercase">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-muted-foreground">{children}</p>}
    </div>
  );
}
