import { Button } from "@/components/ui/button";
import { getTotalPages } from "@/lib/pagination";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ page, pageSize, total, onPageChange }: PaginationControlsProps) {
  const totalPages = getTotalPages(total, pageSize);

  if (total <= pageSize) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Precedent
      </Button>
      <span>
        Page {page} sur {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
      </Button>
    </div>
  );
}
