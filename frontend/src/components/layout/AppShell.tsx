import { NavLink, Outlet } from "react-router-dom";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";
import { useAuth } from "@/hooks/useAuth";
import { isStaff } from "@/lib/roles";

const tabs = [
  { to: "/espace/emprunts", label: "Emprunts" },
  { to: "/espace/recommandations", label: "Recommandations" },
  { to: "/espace/profil", label: "Profil" },
];

const staffTab = { to: "/espace/personnel/comptes", label: "Comptes" };

function tabClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
    : "rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-secondary";
}

export function AppShell() {
  const { user } = useAuth();
  const visibleTabs = isStaff(user) ? [...tabs, staffTab] : tabs;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <div className="border-b border-border/70 bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3 md:px-6">
          {visibleTabs.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={tabClassName}>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
