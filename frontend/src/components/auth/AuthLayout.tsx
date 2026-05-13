import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_24rem] md:px-6 md:py-16">
      <section className="flex flex-col justify-center gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bibliotheque DIT</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="max-w-md text-muted-foreground">{description}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/catalogue" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Retour au catalogue
          </Link>
          <Link to="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Accueil
          </Link>
        </div>
      </section>
      <section className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        {children}
        {footer ? <div className="mt-6 border-t border-border/70 pt-4">{footer}</div> : null}
      </section>
    </div>
  );
}
