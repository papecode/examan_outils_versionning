import type { QueryClient } from "@tanstack/react-query";

export async function invalidateLoanQueries(
  queryClient: QueryClient,
  userId?: number,
): Promise<void> {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ["loans"] }),
    queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  ];

  if (userId !== undefined) {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: ["loans", userId] }),
      queryClient.invalidateQueries({ queryKey: ["recommendations", userId] }),
    );
  }

  await Promise.all(invalidations);
}

export async function invalidateUserQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ["users"] });
}

export async function invalidateBookQueries(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ["books"] });
}
