// Writes one row to the staff activity log. Never throws.
export async function logActivity(actorId: string | null, actorEmail: string, action: string, target = "") {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("activity_log").insert({
      actor_id: actorId, actor_email: actorEmail.slice(0, 200), action: action.slice(0, 120), target: target.slice(0, 200),
    });
  } catch (e) {
    console.error("activity log failed", e);
  }
}
