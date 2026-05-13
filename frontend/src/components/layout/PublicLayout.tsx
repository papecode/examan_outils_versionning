import { Outlet } from "react-router-dom";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNavbar } from "@/components/layout/SiteNavbar";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh min-w-0 flex-col overflow-x-clip">
      <SiteNavbar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
