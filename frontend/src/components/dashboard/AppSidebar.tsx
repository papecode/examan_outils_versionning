import {
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserCircle,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { DitLogo } from "@/components/brand/DitLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultDashboardPath, isStaff } from "@/lib/roles";

const memberItems = [
  { to: "/espace/emprunts", label: "Emprunts", icon: BookOpen },
  { to: "/espace/recommandations", label: "Recommandations", icon: Sparkles },
  { to: "/espace/profil", label: "Profil", icon: UserCircle },
];

const staffItems = [
  { to: "/espace/personnel/comptes", label: "Comptes", icon: Users },
  { to: "/espace/personnel/historique", label: "Historique emprunts", icon: History },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardPath = getDefaultDashboardPath(user);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <DitLogo imageClassName="h-8" />
        <p className="mt-2 text-xs text-muted-foreground">Bibliotheque numerique</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location.pathname === dashboardPath}
                  render={<NavLink to={dashboardPath} />}
                >
                  <LayoutDashboard />
                  <span>Tableau de bord</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {memberItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton render={<NavLink to={item.to} />}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isStaff(user)
                ? staffItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton render={<NavLink to={item.to} />}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                : null}
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link to="/catalogue" />}>
                  <BookOpen />
                  <span>Catalogue</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut />
              <span>Deconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
