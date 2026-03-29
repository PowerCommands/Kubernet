import type { LucideIcon } from "lucide-react";
import { FolderKanban, LayoutDashboard, Network, Server, SquareStack } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const navigationItems: NavItem[] = [
  {
    to: "/overview",
    label: "Overview",
    description: "Environment summary",
    icon: LayoutDashboard,
  },
  {
    to: "/workspaces",
    label: "Workspaces",
    description: "Namespace-based work areas",
    icon: FolderKanban,
  },
  {
    to: "/infrastructure",
    label: "Infrastructure",
    description: "Capacity and reservation",
    icon: Server,
  },
  {
    to: "/topology",
    label: "Topology",
    description: "Relationships and flow",
    icon: Network,
  },
  {
    to: "/resources",
    label: "Resources",
    description: "Technical Kubernetes views",
    icon: SquareStack,
  },
];

export function Sidebar() {
  return (
    <aside>
      <Card className="sticky top-6 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Portal Navigation</CardTitle>
          <CardDescription>Cluster understanding from overview to workspaces and technical detail.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="p-3">
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                  }`
                }
              >
                <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-inherit/80">{item.description}</p>
                </div>
              </NavLink>
            ))}
          </nav>
        </CardContent>
      </Card>
    </aside>
  );
}
