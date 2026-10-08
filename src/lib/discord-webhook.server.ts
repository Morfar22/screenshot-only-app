// Posts embeds to the staff / result Discord webhooks. Failures are logged, never thrown.
type Kind = "staff" | "results";

async function staffPingRole(typeId?: string): Promise<string> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (typeId) {
      const { data: t } = await supabaseAdmin.from("application_types").select("ping_role_id").eq("id", typeId).maybeSingle();
      const tv = (t?.ping_role_id ?? "").trim();
      if (/^\d{5,25}$/.test(tv)) return tv;
    }
    const { data } = await supabaseAdmin.from("site_settings").select("value").eq("key", "discord_ping_role").maybeSingle();
    const v = (data?.value ?? "").trim();
    return /^\d{5,25}$/.test(v) ? v : "";
  } catch {
    return "";
  }
}

export async function sendWebhook(kind: Kind, embed: Record<string, unknown>, typeId?: string) {
  const url = process.env[kind === "staff" ? "DISCORD_WEBHOOK_STAFF" : "DISCORD_WEBHOOK_RESULTS"];
  if (!url || !/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\//.test(url)) return;
  try {
    const roleId = kind === "staff" ? await staffPingRole(typeId) : "";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Nordisk RP",
        embeds: [embed],
        ...(roleId ? { content: `<@&${roleId}>`, allowed_mentions: { roles: [roleId] } } : { allowed_mentions: { parse: [] } }),
      }),
    });
    if (!res.ok) console.error(`Discord webhook ${kind} failed [${res.status}]: ${await res.text()}`);
  } catch (e) {
    console.error("Discord webhook error", e);
  }
}

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

export function newApplicationEmbed(a: { title: string; name: string; source: string; answers: { question: string; answer: string }[] }) {
  return {
    title: `Ny ansøgning: ${cut(a.title, 200)}`,
    color: 0xa5232b,
    description: `**${cut(a.name || "Ukendt", 100)}** — ${a.source === "web" ? "Hjemmeside" : "I spillet"}`,
    fields: a.answers.slice(0, 20).map((x) => ({ name: cut(x.question || "Spørgsmål", 250), value: cut(x.answer || "—", 1000) })),
    timestamp: new Date().toISOString(),
  };
}

export function decisionEmbed(a: { title: string; name: string; status: string; note?: string; discordId?: string | null }) {
  const ok = a.status === "godkendt";
  return {
    title: `${ok ? "Godkendt" : "Afvist"}: ${cut(a.title, 200)}`,
    color: ok ? 0x3ba55d : 0xa5232b,
    description: `${a.discordId ? `<@${a.discordId}> ` : ""}**${cut(a.name || "Ukendt", 100)}**${ok ? " er godkendt." : " er desværre afvist."}${a.note ? `\n\n${cut(a.note, 1500)}` : ""}`,
    timestamp: new Date().toISOString(),
  };
}
