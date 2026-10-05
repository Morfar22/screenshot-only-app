import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Question = { label: string; required?: boolean };

const submitSchema = z.object({
  typeId: z.string().uuid(),
  answers: z.array(z.object({ question: z.string().max(300), answer: z.string().trim().max(4000) })).max(30),
});

function displayName(claims: Record<string, unknown>) {
  const m = (claims["user_metadata"] ?? {}) as Record<string, string>;
  return (m["full_name"] || m["name"] || m["user_name"] || (claims["email"] as string) || "Ukendt").slice(0, 80);
}

export const submitWebApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: type } = await supabaseAdmin.from("application_types").select("id,title,is_open,questions").eq("id", data.typeId).maybeSingle();
    if (!type || !type.is_open) throw new Error("Ansøgningen er lukket");
    for (const q of (type.questions as Question[]) ?? []) {
      if (q.required && !data.answers.find((a) => a.question === q.label && a.answer)) throw new Error(`Besvar: ${q.label}`);
    }
    const { data: pending } = await supabaseAdmin
      .from("ingame_applications").select("id")
      .eq("user_id", context.userId).eq("type_id", data.typeId).eq("status", "afventer").maybeSingle();
    if (pending) throw new Error("Du har allerede en ansøgning, der afventer");
    const name = displayName(context.claims as Record<string, unknown>);
    const { error } = await supabaseAdmin.from("ingame_applications").insert({
      type_id: data.typeId, user_id: context.userId, fivem_identifier: `web:${context.userId}`,
      player_name: name, answers: data.answers, source: "web",
    });
    if (error) throw new Error("Kunne ikke gemme ansøgningen");
    const { sendWebhook, newApplicationEmbed } = await import("./discord-webhook.server");
    await sendWebhook("staff", newApplicationEmbed({ title: type.title, name, source: "web", answers: data.answers }));
    return { ok: true };
  });

export const setApplicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["afventer", "godkendt", "afvist"]), note: z.string().trim().max(1500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Forbidden");
    const { data: row, error } = await context.supabase
      .from("ingame_applications")
      .update({ status: data.status, updated_at: new Date().toISOString(), ...(data.note !== undefined ? { staff_note: data.note } : {}) })
      .eq("id", data.id)
      .select("player_name,staff_note,user_id,application_types(title)")
      .single();
    if (error) throw new Error("Kunne ikke opdatere");
    {
      const { logActivity } = await import("./activity.server");
      await logActivity(context.userId, String((context.claims as Record<string, unknown>)["email"] ?? ""), `Satte ansøgning til ${data.status}`, String((row as Record<string, unknown>)["player_name"] ?? (row as Record<string, unknown>)["character_name"] ?? ""));
    }
    if (data.status !== "afventer") {
      let discordId: string | null = null;
      if (row.user_id) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
        const ident = u.user?.identities?.find((i) => i.provider === "discord");
        discordId = (ident?.identity_data?.["provider_id"] as string) ?? ident?.id ?? null;
      }
      const { sendWebhook, decisionEmbed } = await import("./discord-webhook.server");
      await sendWebhook("results", decisionEmbed({
        title: (row.application_types as { title: string } | null)?.title ?? "Ansøgning",
        name: row.player_name, status: data.status, note: row.staff_note, discordId,
      }));
    }
    return { ok: true };
  });

const whitelistSchema = z.object({
  discord_name: z.string().trim().min(2).max(64),
  age: z.number().int().min(13).max(99),
  character_name: z.string().trim().min(2).max(80),
  backstory: z.string().trim().min(50).max(4000),
  rp_experience: z.string().trim().max(2000).optional(),
  read_rules: z.literal(true),
});

export const submitWhitelistApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => whitelistSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("whitelist_applications").insert({
      ...data, rp_experience: data.rp_experience ?? null, user_id: context.userId,
    });
    if (error) throw new Error("Kunne ikke gemme ansøgningen");
    const { sendWebhook, newApplicationEmbed } = await import("./discord-webhook.server");
    await sendWebhook("staff", newApplicationEmbed({
      title: "Whitelist", name: data.character_name, source: "web",
      answers: [
        { question: "Discord-navn", answer: data.discord_name },
        { question: "Alder", answer: String(data.age) },
        { question: "Baggrundshistorie", answer: data.backstory },
        ...(data.rp_experience ? [{ question: "RP-erfaring", answer: data.rp_experience }] : []),
      ],
    }));
    return { ok: true };
  });

export const setWhitelistStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["afventer", "godkendt", "afvist"]), note: z.string().trim().max(1500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Forbidden");
    const { data: row, error } = await context.supabase
      .from("whitelist_applications")
      .update({ status: data.status, ...(data.note !== undefined ? { staff_note: data.note } : {}) })
      .eq("id", data.id)
      .select("character_name,user_id,staff_note")
      .single();
    if (error) throw new Error("Kunne ikke opdatere");
    {
      const { logActivity } = await import("./activity.server");
      await logActivity(context.userId, String((context.claims as Record<string, unknown>)["email"] ?? ""), `Satte ansøgning til ${data.status}`, String((row as Record<string, unknown>)["player_name"] ?? (row as Record<string, unknown>)["character_name"] ?? ""));
    }
    if (data.status !== "afventer") {
      let discordId: string | null = null;
      if (row.user_id) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(row.user_id);
        const ident = u.user?.identities?.find((i) => i.provider === "discord");
        discordId = (ident?.identity_data?.["provider_id"] as string) ?? ident?.id ?? null;
      }
      const { sendWebhook, decisionEmbed } = await import("./discord-webhook.server");
      await sendWebhook("results", decisionEmbed({ title: "Whitelist", name: row.character_name, status: data.status, note: row.staff_note, discordId }));
    }
    return { ok: true };
  });

export const summarizeApplicationText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ text: z.string().trim().min(20).max(20000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isStaff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!isStaff) throw new Error("Kun staff har adgang");
    const { summarizeApplication } = await import("./ai-summary.server");
    return { summary: await summarizeApplication(data.text) };
  });
