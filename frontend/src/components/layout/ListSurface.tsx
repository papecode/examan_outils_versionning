import type { ReactNode } from "react";

interface ListSurfaceProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function ListSurface({ children, footer }: ListSurfaceProps) {
  return (
    <div className="flex flex-col gap-6">
      {children}
      {footer ? <div className="flex justify-center border-t border-border/70 pt-4">{footer}</div> : null}
    </div>
  );
}
