import { createFileRoute, redirect } from "@tanstack/react-router";

// Old staff page — the admin panel replaced it.
export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: () => { throw redirect({ to: "/admin" }); },
});
