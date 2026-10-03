import { createFileRoute } from "@tanstack/react-router";
import { WhitelistPanel } from "@/components/admin-whitelist";
import { adminHead, AdminTitle } from "./route";

export const Route = createFileRoute("/_authenticated/admin/whitelist")({
  head: adminHead("Whitelist"),
  component: () => (
    <>
      <AdminTitle eyebrow="Ansøgninger" title="Whitelist">Ansøgninger sendt fra /ansog.</AdminTitle>
      <WhitelistPanel />
    </>
  ),
});
