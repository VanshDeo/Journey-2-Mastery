import { z } from "zod";
import type { PaginationMeta } from "./apiResponse.js";

/**
 * Cursor-based (keyset) pagination — no OFFSET, scales well.
 *
 * Usage:
 *   const { cursor, limit } = parsePagination(c.req.query());
 *   // In your query: WHERE id > cursor ORDER BY id ASC LIMIT limit + 1
 *   // Then: const { items, meta } = buildPaginatedResponse(rows, limit);
 */

export const paginationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Parse and validate pagination query params.
 */
export function parsePagination(query: Record<string, string | undefined>): PaginationQuery {
  return paginationQuerySchema.parse(query);
}

/**
 * Build paginated response from query results.
 *
 * Pattern: query for `limit + 1` rows. If you get `limit + 1` results,
 * there's a next page — the last item's id becomes the next cursor.
 *
 * @param rows - Query results (should have queried limit + 1)
 * @param limit - The requested page size
 * @param total - Optional total count (only include when cheap to compute)
 */
export function buildPaginatedResponse<T extends { id: string }>(
  rows: T[],
  limit: number,
  total?: number
): { items: T[]; meta: PaginationMeta } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const lastItem = items[items.length - 1];

  return {
    items,
    meta: {
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      limit,
      ...(total !== undefined && { total }),
    },
  };
}
