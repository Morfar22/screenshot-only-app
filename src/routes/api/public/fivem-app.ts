import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Endpoint for the in-game kartik-laptop app. The FiveM server (never the
// player's browser) calls this with the secret key in the x-api-key header.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function authorize(request: Request) {
  const key = request.headers.get("x-api-key") ?? "";
  if (key.length < 16) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("fivem_app_keys").select("id").eq("api_key", key).maybeSingle();
  return data ? supabaseAdmin : null;
}

const identifier = z.string().trim().min(3).max(120);

const submitSchema = z.object({
  identifier,
  playerName: z.string().trim().max(80).default(""),
  typeId: z.string().uuid(),
  answers: z.array(z.object({ question: z.string().max(300), answer: z.string().trim().max(4000) })).max(30),
});

type Question = { label: string; required?: boolean; long?: boolean };

export const Route = createFileRoute("/api/public/fivem-app")({
  server: {
    handlers: {
      // GET ?identifier=license:xxx -> open types + the player's own applications
      GET: async ({ request }) => {
        const db = await authorize(request);
        if (!db) return json({ error: "Ugyldig nøgle" }, 401);
        const id = identifier.safeParse(new URL(request.url).searchParams.get("identifier") ?? "");
        const { data: types } = await db
          .from("application_types")
          .select("id,title,description,questions")
          .eq("is_open", true)
          .order("created_at", { ascending: true });
        let applications: unknown[] = [];
        if (id.success) {
          const { data } = await db
            .from("ingame_applications")
            .select("id,status,staff_note,created_at,updated_at,application_types(title)")
            .eq("fivem_identifier", id.data)
            .order("created_at", { ascending: false })
            .limit(20);
          applications = (data ?? []).map((a) => ({
            id: a.id,
            title: (a.application_types as { title: string } | null)?.title ?? "Ansøgning",
            status: a.status,
            note: a.staff_note,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
          }));
        }
        return json({ types: types ?? [], applications });
      },
      POST: async ({ request }) => {
        const db = await authorize(request);
        if (!db) return json({ error: "Ugyldig nøgle" }, 401);
        const parsed = submitSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "Ugyldige data" }, 400);
        const { identifier: ident, playerName, typeId, answers } = parsed.data;

        const { data: type } = await db.from("application_types").select("id,is_open,questions").eq("id", typeId).maybeSingle();
        if (!type || !type.is_open) return json({ error: "Ansøgningen er lukket" }, 400);
        const questions = (type.questions as Question[]) ?? [];
        for (const q of questions) {
          if (q.required && !answers.find((a) => a.question === q.label && a.answer.length > 0)) {
            return json({ error: `Besvar: ${q.label}` }, 400);
          }
        }
        const { data: pending } = await db
          .from("ingame_applications")
          .select("id")
          .eq("fivem_identifier", ident)
          .eq("type_id", typeId)
          .eq("status", "afventer")
          .maybeSingle();
        if (pending) return json({ error: "Du har allerede en ansøgning, der afventer" }, 409);

        const { error } = await db.from("ingame_applications").insert({ type_id: typeId, fivem_identifier: ident, player_name: playerName, answers });
        if (error) {
          console.error("fivem-app insert", error);
          return json({ error: "Kunne ikke gemme ansøgningen" }, 500);
        }
        return json({ ok: true }, 201);
      },
    },
  },
});
