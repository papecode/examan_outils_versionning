import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="font-heading text-lg">Bibliotheque numerique DIT</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/catalogue">Catalogue</Link>
            <Link to="/connexion">Connexion</Link>
            <Link to="/espace/emprunts">Espace emprunts</Link>
          </div>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Plateforme academique de consultation, emprunt et recommandations de livres.
        </p>
      </div>
    </footer>
  );
}
