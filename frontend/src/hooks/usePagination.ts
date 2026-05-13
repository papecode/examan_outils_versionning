import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/types/pagination";
import { getTotalPages, normalizePage, normalizePageSize } from "@/lib/pagination";

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  resetKey?: string | number;
}

export function usePagination({
  initialPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(() => normalizePage(initialPage));
  const safePageSize = normalizePageSize(pageSize);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const goToPage = useCallback((nextPage: number) => {
    setPage(normalizePage(nextPage));
  }, []);

  const goToPrevious = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToNext = useCallback((total: number) => {
    setPage((current) => Math.min(getTotalPages(total, safePageSize), current + 1));
  }, [safePageSize]);

  return useMemo(
    () => ({
      page,
      pageSize: safePageSize,
      setPage: goToPage,
      goToPrevious,
      goToNext,
    }),
    [page, safePageSize, goToPage, goToPrevious, goToNext],
  );
}
