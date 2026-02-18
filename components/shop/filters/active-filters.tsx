"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { CategoryNode } from "@/lib/types/shop";

interface ActiveFiltersProps {
  selectedCategories: string[]; // Now stores slugs
  priceMin: number | null;
  priceMax: number | null;
  search: string;
  categories: CategoryNode[];
  onClearCategory: (categorySlug: string) => void;
  onClearPriceRange: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

function findCategoryNameBySlug(
  categories: CategoryNode[],
  categorySlug: string
): string | null {
  for (const cat of categories) {
    if (cat.slug === categorySlug) return cat.name;
    const found = findCategoryNameBySlug(cat.children, categorySlug);
    if (found) return found;
  }
  return null;
}

export function ActiveFilters({
  selectedCategories,
  priceMin,
  priceMax,
  search,
  categories,
  onClearCategory,
  onClearPriceRange,
  onClearSearch,
  onClearAll,
}: ActiveFiltersProps) {
  const hasFilters =
    selectedCategories.length > 0 ||
    priceMin !== null ||
    priceMax !== null ||
    search;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <Badge variant="secondary" className="gap-1 pl-3 pr-2">
          Search: {search}
          <button
            onClick={onClearSearch}
            className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {selectedCategories.map((catSlug) => {
        const catName = findCategoryNameBySlug(categories, catSlug);
        if (!catName) return null;
        return (
          <Badge key={catSlug} variant="secondary" className="gap-1 pl-3 pr-2">
            {catName}
            <button
              onClick={() => onClearCategory(catSlug)}
              className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {(priceMin !== null || priceMax !== null) && (
        <Badge variant="secondary" className="gap-1 pl-3 pr-2">
          {formatCurrency(priceMin || 0)} - {formatCurrency(priceMax || Infinity)}
          <button
            onClick={onClearPriceRange}
            className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-slate-500 hover:text-slate-700"
      >
        Clear all
      </Button>
    </div>
  );
}
