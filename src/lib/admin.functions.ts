import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string; claims: Record<string, unknown> };
const emailOf = (c: Ctx) => String(c.claims["email"] ?? "");

async function requireStaff(c: Ctx) {
  const { data } = await c.supabase.rpc("is_staff", { _user_id: c.userId });
  if (!data) throw new Error("Kun staff har adgang");
}
async function requireAdmin(c: Ctx) {
  const { data } = await c.supabase.rpc("has_role", { _user_id: c.userId, _role: "admin" });
  if (!data) throw new Error("Kun admins har adgang");
}

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const c = context as unknown as Ctx;
    const [{ data: staff }, { data: admin }] = await Promise.all([
      c.supabase.rpc("is_staff", { _user_id: c.userId }),
      c.supabase.rpc("has_role", { _user_id: c.userId, _role: "admin" }),
    ]);
    return { isStaff: !!staff, isAdmin: !!admin, email: emailOf(c) };
  });

export const logAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ action: z.string().min(1).max(120), target: z.string().max(200).default("") }).parse(d))
  .handler(async ({ data, context }) => {
    const c = context as unknown as Ctx;
    await requireStaff(c);
    const { logActivity } = await import("./activity.server");
    await logActivity(c.userId, emailOf(c), data.action, data.target);
    return { ok: true };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const c = context as unknown as Ctx;
    await requireAdmin(c);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id,role");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const map = new Map<string, { userId: string; email: string; roles: string[] }>();
    for (const r of roles ?? []) {
      const u = users.users.find((x) => x.id === r.user_id);
      const e = map.get(r.user_id) ?? { userId: r.user_id, email: u?.email ?? "Ukendt", roles: [] };
      e.roles.push(r.role);
      map.set(r.user_id, e);
    }
    return { me: c.userId, staff: [...map.values()] };
  });

export const setStaffRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().trim().email(), role: z.enum(["admin", "staff"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const c = context as unknown as Ctx;
    await requireAdmin(c);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const user = users.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("Ingen konto med den email. Personen skal logge ind på siden én gang først.");
    if (!data.grant && user.id === c.userId && data.role === "admin") throw new Error("Du kan ikke fjerne din egen admin-rolle.");
    if (data.grant) {
      const { error } = await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error("Kunne ikke give adgang");
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user.id).eq("role", data.role);
    }
    const { logActivity } = await import("./activity.server");
    await logActivity(c.userId, emailOf(c), data.grant ? `Gav ${data.role}-rolle` : `Fjernede ${data.role}-rolle`, user.email ?? "");
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), kind: z.enum(["whitelist", "ingame"]), name: z.string().max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const c = context as unknown as Ctx;
    await requireStaff(c);
    const table = data.kind === "whitelist" ? "whitelist_applications" : "ingame_applications";
    const { error } = await c.supabase.from(table).delete().eq("id", data.id);
    if (error) throw new Error("Kunne ikke slette");
    const { logActivity } = await import("./activity.server");
    await logActivity(c.userId, emailOf(c), data.kind === "whitelist" ? "Slettede whitelist-ansøgning" : "Slettede spil-ansøgning", data.name);
    return { ok: true };
  });
