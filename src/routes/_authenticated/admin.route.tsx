import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Today" },
  { to: "/admin/people", label: "People" },
  { to: "/admin/pipeline", label: "Pipeline" },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/interviews", label: "Interviews" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/import", label: "Bring people in" },
  { to: "/admin/settings", label: "Settings" },
] as const;

function AdminLayout() {
  return (
    <div className="container-editorial py-10">
      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            activeOptions={{ exact: link.to === "/admin" }}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-secondary [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
