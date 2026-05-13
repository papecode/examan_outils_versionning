import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StatisticItem {
  label: string;
  value: string;
  hint?: string;
}

interface StatisticsBlockProps {
  items: StatisticItem[];
}

export function StatisticsBlock({ items }: StatisticsBlockProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.value}</p>
            {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface QuickActionsProps {
  children: ReactNode;
}

export function QuickActions({ children }: QuickActionsProps) {
  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-base">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">{children}</CardContent>
    </Card>
  );
}
