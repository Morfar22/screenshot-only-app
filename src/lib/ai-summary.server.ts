import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set(RUN_ID, runId);
    const res = await fetch(input, { ...init, headers });
    runId ??= res.headers.get(RUN_ID)?.trim() || undefined;
    return res;
  };
}

const SYSTEM = `Du er en erfaren staff-assistent på Nordisk RP, en dansk FiveM-rollespilsserver med fokus på seriøst, karakterdrevet RP.
Du får en ansøgning indsat af staff. Skriv på dansk, kort og præcist (maks. ca. 250 ord), i Markdown med disse afsnit:
## Opsummering
2-4 sætninger om ansøgeren og ansøgningen.
## Styrker
Punktliste.
## Opmærksomhedspunkter
Punktliste (fx tynde svar, regelbrud, alder, manglende RP-forståelse, kopieret tekst, powergaming/metagaming-tendenser).
## Forslag til opfølgende spørgsmål
1-3 spørgsmål staff kan stille.
## Samlet vurdering
Én linje: "Anbefal godkendelse", "Kræver samtale" eller "Anbefal afvisning" + kort begrundelse.
Du træffer ikke beslutningen — staff gør. Opdigt ikke fakta, der ikke står i ansøgningen.`;

export async function summarizeApplication(text: string, signal?: AbortSignal) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI er ikke konfigureret");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch(),
  });
  let streamError: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM,
    prompt: `Ansøgning:\n\n${text}`,
    ...(signal ? { abortSignal: signal } : {}),
    onError: ({ error }) => { streamError = error; },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const out = await result.text;
  if (!out.trim()) {
    const status = (streamError as { statusCode?: number })?.statusCode;
    if (status === 429) throw new Error("For mange forespørgsler lige nu — prøv igen om lidt.");
    if (status === 402) throw new Error("AI-kreditterne er brugt op. Tilføj flere under Settings → Plans & credits.");
    if (status === 403) throw new Error("AI-adgang er blokeret for arbejdsområdet.");
    console.error("AI summary failed", streamError);
    throw new Error("AI'en kunne ikke lave en opsummering.");
  }
  return out;
}
