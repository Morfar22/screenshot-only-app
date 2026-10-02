import { createFileRoute } from "@tanstack/react-router";

const FIVEM_HOST = "game.nethost-solutions.dk";
const FIVEM_PORT = 30122;

async function fetchJson(path: string) {
  const res = await fetch(`http://${FIVEM_HOST}:${FIVEM_PORT}${path}`, {
    signal: AbortSignal.timeout(6000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`FiveM svarede ${res.status}`);
  return res.json();
}

export const Route = createFileRoute("/api/public/fivem-status")({
  server: {
    handlers: {
      GET: async () => {
        let online = false;
        let players: number | null = null;
        let maxPlayers: number | null = null;
        try {
          const [dynamic, info] = await Promise.all([fetchJson("/dynamic.json"), fetchJson("/info.json")]);
          online = true;
          players = typeof dynamic?.clients === "number" ? dynamic.clients : null;
          maxPlayers =
            typeof dynamic?.sv_maxclients === "number" ? dynamic.sv_maxclients
            : typeof info?.vars?.sv_maxClients === "string" ? Number(info.vars.sv_maxClients)
            : null;
        } catch {
          online = false;
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: current } = await supabaseAdmin
          .from("server_status")
          .select("id,status")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (current) {
          // Staff-sat "vedligeholdelse" bevares; ellers styres status automatisk.
          const nextStatus = current.status === "vedligeholdelse" && !online ? "offline"
            : current.status === "vedligeholdelse" ? "vedligeholdelse"
            : online ? "online" : "offline";
          const message = online
            ? players != null && maxPlayers != null
              ? `${players} af ${maxPlayers} spillere online lige nu.`
              : "Serveren kører normalt. God fornøjelse i byen."
            : "Serveren svarer ikke lige nu. Vi kigger på det — følg med på Discord.";
          await supabaseAdmin
            .from("server_status")
            .update({ status: nextStatus, message, players, max_players: maxPlayers, updated_at: new Date().toISOString() })
            .eq("id", current.id);
        }

        return Response.json(
          { online, players, maxPlayers, checkedAt: new Date().toISOString() },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
