import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type RuleSection = { id: string; title: string; sort: number; rules: { id: string; number: string; title: string; body: string; sort: number; updated_at: string }[] };

export const listRules = createServerFn({ method: "GET" }).handler(async (): Promise<RuleSection[]> => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const [{ data: secs, error: e1 }, { data: rules, error: e2 }] = await Promise.all([
    db.from("rule_sections").select("id,title,sort").order("sort"),
    db.from("rules").select("id,section_id,number,title,body,sort,updated_at").order("sort"),
  ]);
  if (e1 || e2) throw new Error("Kunne ikke hente reglerne");
  return (secs ?? []).map((s) => ({ ...s, rules: (rules ?? []).filter((r) => r.section_id === s.id) }));
});

async function staffGuard(context: { supabase: any; userId: string; claims: unknown }) {
  const { data } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  if (!data) throw new Error("Kun staff har adgang");
  const email = String((context.claims as Record<string, unknown>)["email"] ?? "");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { logActivity } = await import("./activity.server");
  return { db: supabaseAdmin, log: (a: string, t: string) => logActivity(context.userId, email, a, t) };
}

const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  section_id: z.string().min(1).max(60),
  number: z.string().trim().min(1).max(20),
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().max(5000),
  sort: z.number().int().min(0).max(10000),
});

export const saveRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ruleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { db, log } = await staffGuard(context);
    const { id, ...row } = data;
    const { error } = id
      ? await db.from("rules").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id)
      : await db.from("rules").insert(row);
    if (error) throw new Error("Kunne ikke gemme reglen");
    await log(id ? "Rettede regel" : "Tilføjede regel", `§${row.number} ${row.title}`);
    return { ok: true };
  });

export const deleteRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), label: z.string().max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { db, log } = await staffGuard(context);
    const { error } = await db.from("rules").delete().eq("id", data.id);
    if (error) throw new Error("Kunne ikke slette reglen");
    await log("Slettede regel", data.label);
    return { ok: true };
  });

export const saveSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().optional(), title: z.string().trim().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { db, log } = await staffGuard(context);
    if (data.id) {
      const { error } = await db.from("rule_sections").update({ title: data.title }).eq("id", data.id);
      if (error) throw new Error("Kunne ikke gemme kategorien");
      await log("Omdøbte regelkategori", data.title);
    } else {
      const slug = data.title.toLowerCase().normalize("NFKD").replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || `kategori-${Date.now()}`;
      const { data: last } = await db.from("rule_sections").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
      const { error } = await db.from("rule_sections").insert({ id: slug, title: data.title, sort: (last?.sort ?? 0) + 1 });
      if (error) throw new Error("Kunne ikke oprette kategorien (findes navnet allerede?)");
      await log("Oprettede regelkategori", data.title);
    }
    return { ok: true };
  });

export const deleteSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().min(1).max(60), title: z.string().max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { db, log } = await staffGuard(context);
    const { error } = await db.from("rule_sections").delete().eq("id", data.id);
    if (error) throw new Error("Kunne ikke slette kategorien");
    await log("Slettede regelkategori", data.title);
    return { ok: true };
  });
