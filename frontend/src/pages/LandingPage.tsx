import { ArrowRight, BookOpen, Sparkles, Workflow } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FeaturedBooks } from "@/components/books/FeaturedBooks";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: BookOpen,
    title: "Catalogue public",
    description: "Parcourez et recherchez les ouvrages avant de vous connecter.",
  },
  {
    icon: Workflow,
    title: "Emprunts simplifies",
    description: "Reservez un livre depuis le catalogue puis finalisez l'emprunt dans votre espace.",
  },
  {
    icon: Sparkles,
    title: "Recommandations IA",
    description: "Recevez des suggestions personnalisees basees sur l'historique des emprunts.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/70 bg-[radial-gradient(circle_at_top_left,oklch(0.94_0.04_85),transparent_45%),radial-gradient(circle_at_bottom_right,oklch(0.92_0.05_150),transparent_40%)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:px-6 md:py-24">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Dakar Institute of Technology</p>
            <h1 className="font-heading text-4xl font-semibold leading-tight md:text-6xl">
              La bibliotheque academique, pensee comme une vitrine vivante.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Consultez le catalogue, empruntez vos references et decouvrez des recommandations
              personnalisees dans une experience claire et responsive.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalogue" className={cn(buttonVariants({ size: "lg" }))}>
                Explorer le catalogue
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Button size="lg" variant="outline" onClick={() => navigate("/connexion")}>
                Se connecter
              </Button>
            </div>
          </div>
          <Card className="self-end border-primary/20 bg-card/80 shadow-xl">
            <CardHeader>
              <CardTitle>Comment emprunter</CardTitle>
              <CardDescription>Trois etapes pour acceder a un ouvrage.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
              <p>1. Parcourez le catalogue public et choisissez un livre.</p>
              <p>2. Connectez-vous avec votre nom ou identifiant DIT.</p>
              <p>3. Finalisez l&apos;emprunt et suivez votre historique dans l&apos;espace personnel.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Services</p>
          <h2 className="font-heading text-3xl font-semibold">Une plateforme complete pour la communaute DIT</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="bg-card/90">
              <CardHeader>
                <item.icon className="text-primary" />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Selection</p>
              <h2 className="font-heading text-3xl font-semibold">Coups de coeur du catalogue</h2>
            </div>
            <Link to="/catalogue" className={cn(buttonVariants({ variant: "outline" }))}>
              Voir tout le catalogue
            </Link>
          </div>
          <FeaturedBooks />
        </div>
      </section>
    </div>
  );
}
