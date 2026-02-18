"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CategoryFilter } from "./category-filter";
import { PriceFilter } from "./price-filter";
import { ApplyFiltersButton } from "./apply-filters-button";
import type { CategoryNode, FilterValidationError } from "@/lib/types/shop";

interface MobileFilterDrawerProps {
  categories: CategoryNode[];
  pendingCategories: string[];
  pendingPriceMin: number | null;
  pendingPriceMax: number | null;
  minPrice: number;
  maxPrice: number;
  appliedFiltersCount: number;
  pendingChangesCount: number;
  hasPendingChanges: boolean;
  validationErrors: FilterValidationError[];
  onToggleCategory: (categoryId: string) => void;
  onPriceChange: (min: number | null, max: number | null) => void;
  onApply: () => boolean;
  onClearPending: () => void;
}

export function MobileFilterDrawer({
  categories,
  pendingCategories,
  pendingPriceMin,
  pendingPriceMax,
  minPrice,
  maxPrice,
  appliedFiltersCount,
  pendingChangesCount,
  hasPendingChanges,
  validationErrors,
  onToggleCategory,
  onPriceChange,
  onApply,
  onClearPending,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    const success = onApply();
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {appliedFiltersCount > 0 && (
            <span className="ml-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {appliedFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {hasPendingChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearPending}
                className="text-slate-500"
              >
                Reset
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <CategoryFilter
            categories={categories}
            selectedCategories={pendingCategories}
            onToggle={onToggleCategory}
          />

          <Separator />

          <PriceFilter
            minPrice={minPrice}
            maxPrice={maxPrice}
            currentMin={pendingPriceMin}
            currentMax={pendingPriceMax}
            onChange={onPriceChange}
            validationErrors={validationErrors}
          />
        </div>

        <div className="mt-8">
          <ApplyFiltersButton
            pendingChangesCount={pendingChangesCount}
            hasPendingChanges={hasPendingChanges}
            onApply={handleApply}
            disabled={validationErrors.length > 0}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
