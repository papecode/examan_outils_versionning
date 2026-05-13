import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DitLogo } from "@/components/brand/DitLogo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthMode = "signIn" | "forgotPassword";

interface AuthLayoutProps {
  mode: AuthMode;
  children: ReactNode;
  footer?: ReactNode;
}

const copy: Record<
  AuthMode,
  { panelTitle: string; panelDescription: string; cardTitle: string; cardDescription: string }
> = {
  signIn: {
    panelTitle: "Bibliotheque numerique",
    panelDescription:
      "Accedez a votre espace emprunt, a vos recommandations et a votre profil avec vos identifiants institutionnels.",
    cardTitle: "Connexion",
    cardDescription: "Utilisez votre email institutionnel ou votre identifiant numerique.",
  },
  forgotPassword: {
    panelTitle: "Reinitialisation securisee",
    panelDescription:
      "Indiquez l'email associe a votre compte. La reponse reste volontairement generique pour proteger votre compte.",
    cardTitle: "Mot de passe oublie",
    cardDescription: "Nous vous enverrons les instructions si un compte correspond a cet email.",
  },
};

export function AuthLayout({ mode, children, footer }: AuthLayoutProps) {
  const content = copy[mode];

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between border-r border-border/70 bg-muted/40 p-8 lg:flex lg:p-12">
        <DitLogo imageClassName="h-10" />
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{content.panelTitle}</h1>
          <p className="text-muted-foreground">{content.panelDescription}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Accueil
            </Link>
            <Link to="/catalogue" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Catalogue
            </Link>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Dakar Institute of Technology</p>
      </section>

      <section className="flex flex-col items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="mb-8 flex w-full max-w-sm flex-col gap-3 lg:hidden">
          <DitLogo />
          <p className="text-sm text-muted-foreground">{content.panelTitle}</p>
        </div>

        <Card className="w-full max-w-sm border-border/80 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{content.cardTitle}</CardTitle>
            <CardDescription>{content.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {children}
            {footer ? <div className="border-t border-border/70 pt-4">{footer}</div> : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
