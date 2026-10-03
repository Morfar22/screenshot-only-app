import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IngameApplications, TypeEditor, ApiKeyBox } from "@/components/staff-ingame";
import { adminHead, AdminTitle } from "./route";

export const Route = createFileRoute("/_authenticated/admin/ansogninger")({
  head: adminHead("Ansøgninger"),
  component: Page,
});

function Page() {
  const [view, setView] = useState<"svar" | "typer" | "fivem">("svar");
  const tabs = [["svar", "Indkomne"], ["typer", "Ansøgningstyper"], ["fivem", "FiveM-forbindelse"]] as const;
  return (
    <>
      <AdminTitle eyebrow="Ansøgninger" title="Ansøgninger">Fra hjemmesiden og laptop-appen i spillet.</AdminTitle>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={view === k ? "btn-primary" : "btn-ghost"}>{l}</button>
        ))}
      </div>
      {view === "svar" && <IngameApplications />}
      {view === "typer" && <TypeEditor />}
      {view === "fivem" && <ApiKeyBox />}
    </>
  );
}
