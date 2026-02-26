"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface InventoryMovement {
  id: string;
  productId: string;
  productSizeId: string | null;
  type: "in" | "out" | "adjust";
  quantity: number;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  productName: string | null;
  sizeName: string | null;
  sku: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MovementsClientProps {
  movements: InventoryMovement[];
  pagination: Pagination;
}

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Stock In", value: "in" },
  { label: "Stock Out", value: "out" },
  { label: "Adjustment", value: "adjust" },
] as const;

function TypeBadge({ type }: { type: string }) {
  if (type === "in")
    return (
      <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">
        Stock In
      </Badge>
    );
  if (type === "out")
    return (
      <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">
        Stock Out
      </Badge>
    );
  if (type === "adjust")
    return (
      <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
        Adjustment
      </Badge>
    );
  return <Badge variant="outline">{type}</Badge>;
}

export function MovementsClient({
  movements,
  pagination,
}: MovementsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeType = searchParams.get("type") ?? "";
  const activeSearch = searchParams.get("search") ?? "";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      // Reset page on filter change (unless explicitly setting page)
      if (!("page" in updates)) params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {TYPE_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => updateParams({ type: value })}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeType === value
                  ? "bg-background shadow text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search product or SKU..."
            defaultValue={activeSearch}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ search: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-12"
                >
                  No movements found
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate">
                    {m.productName ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{m.sizeName ?? "—"}</TableCell>
                  <TableCell>
                    <TypeBadge type={m.type} />
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    <span
                      className={
                        m.type === "in"
                          ? "text-green-600"
                          : m.type === "out"
                            ? "text-red-600"
                            : "text-blue-600"
                      }
                    >
                      {m.type === "in" ? "+" : m.type === "out" ? "-" : ""}
                      {m.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                    {m.reason ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(m.updatedAt).toLocaleString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} movements
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                updateParams({ page: String(pagination.page - 1) })
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                updateParams({ page: String(pagination.page + 1) })
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
