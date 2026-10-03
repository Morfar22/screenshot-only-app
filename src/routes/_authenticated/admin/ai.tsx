import { createFileRoute } from "@tanstack/react-router";
import { AiSummaryPanel } from "@/components/staff-ai-summary";
import { adminHead } from "./route";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: adminHead("AI-assistent"),
  component: () => <div className="-mt-16"><AiSummaryPanel /></div>,
});
