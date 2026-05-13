import { Outlet } from "react-router-dom";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
