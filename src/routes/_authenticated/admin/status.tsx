import { createFileRoute } from "@tanstack/react-router";
import { StatusPanel } from "@/components/staff-status";
import { adminHead } from "./route";

export const Route = createFileRoute("/_authenticated/admin/status")({
  head: adminHead("Serverstatus"),
  component: () => <div className="-mt-16"><StatusPanel /></div>,
});
