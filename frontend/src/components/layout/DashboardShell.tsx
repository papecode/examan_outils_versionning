import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DashboardShell() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-x-clip">
          <header className="sticky top-0 z-40 flex h-14 min-w-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="shrink-0 cursor-pointer" />
            <span className="truncate text-sm text-muted-foreground">Espace bibliotheque</span>
          </header>
          <div className="min-w-0 flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
