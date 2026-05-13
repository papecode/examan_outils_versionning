import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex flex-col gap-2">
        {eyebrow ? (
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-pretty text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-2 md:w-auto">{actions}</div> : null}
    </div>
  );
}
