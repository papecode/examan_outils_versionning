import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { DitLogo } from "@/components/brand/DitLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const publicLinks = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
];

const spaceLinks = [
  { to: "/espace/emprunts", label: "Emprunts" },
  { to: "/espace/recommandations", label: "Recommandations" },
  { to: "/espace/profil", label: "Profil" },
];

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "text-primary font-medium underline underline-offset-4"
    : "text-muted-foreground hover:text-foreground transition-colors";
}

export function SiteNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
        <DitLogo imageClassName="h-8 w-auto max-w-[9rem] sm:max-w-none sm:h-9" />

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClassName}>
              {link.label}
            </NavLink>
          ))}
          {user
            ? spaceLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClassName}>
                  {link.label}
                </NavLink>
              ))
            : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                {user.nom}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/espace/profil")}>Mon profil</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>Deconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/connexion")}>Connexion</Button>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                aria-label="Ouvrir le menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-4">
              {publicLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-lg">
                  {link.label}
                </Link>
              ))}
              {user
                ? spaceLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-lg">
                      {link.label}
                    </Link>
                  ))
                : null}
              {user ? (
                <Button variant="secondary" onClick={() => logout()}>
                  Deconnexion
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setOpen(false);
                    navigate("/connexion");
                  }}
                >
                  Connexion
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
