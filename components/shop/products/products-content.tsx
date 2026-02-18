"use client";

import { useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCardShop } from "@/components/shop/product-card-shop";
import { CategoryFilter } from "@/components/shop/filters/category-filter";
import { PriceFilter } from "@/components/shop/filters/price-filter";
import { ActiveFilters } from "@/components/shop/filters/active-filters";
import { MobileFilterDrawer } from "@/components/shop/filters/mobile-filter-drawer";
import { ApplyFiltersButton } from "@/components/shop/filters/apply-filters-button";
import { SearchBar } from "@/components/shop/search/search-bar";
import { SortDropdown } from "@/components/shop/sorting/sort-dropdown";
import { PerPageSelector } from "@/components/shop/sorting/per-page-selector";
import { Pagination } from "@/components/shop/pagination/pagination";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { SORT_OPTIONS } from "@/lib/types/shop";
import type { ShopProductsResponse, CategoryNode } from "@/lib/types/shop";

interface ProductsContentProps {
  initialProducts: ShopProductsResponse;
  categories: CategoryNode[];
}

export function ProductsContent({
  initialProducts,
  categories,
}: ProductsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const {
    appliedFilters,
    pendingFilters,
    toggleCategory,
    setPriceRange,
    applyFilters,
    resetPending,
    clearAllFilters,
    setDebouncedSearch,
    clearSearch,
    validationErrors,
    hasPendingChanges,
    pendingChangesCount,
    activeFiltersCount,
  } = useProductFilters();

  const { products, pagination } = initialProducts;

  // Handle sort with transition for loading state
  const handleSortChange = useCallback(
    (value: string) => {
      const option = SORT_OPTIONS.find((opt) => opt.value === value);
      if (!option) return;

      const params = new URLSearchParams(searchParams.toString());
      if (option.sortBy !== "date") {
        params.set("sortBy", option.sortBy);
      } else {
        params.delete("sortBy");
      }
      if (option.sortOrder !== "desc") {
        params.set("sortOrder", option.sortOrder);
      } else {
        params.delete("sortOrder");
      }

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Handle page change with transition
  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page !== 1) {
        params.set("page", page.toString());
      } else {
        params.delete("page");
      }

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // Handle per page change with transition
  const handlePerPageChange = useCallback(
    (perPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (perPage !== 12) {
        params.set("perPage", perPage.toString());
      } else {
        params.delete("perPage");
      }
      params.set("page", "1");

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  const currentSortValue =
    SORT_OPTIONS.find(
      (option) =>
        option.sortBy === appliedFilters.sortBy &&
        option.sortOrder === appliedFilters.sortOrder
    )?.value || "date-desc";

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters - Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 space-y-6">
          {/* Apply Filters Button - At Top */}
          <ApplyFiltersButton
            pendingChangesCount={pendingChangesCount}
            hasPendingChanges={hasPendingChanges}
            onApply={applyFilters}
            disabled={validationErrors.length > 0}
          />

          {hasPendingChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPending}
              className="w-full text-slate-500"
            >
              Reset Changes
            </Button>
          )}

          <Separator />

          {/* Category Filter */}
          <CategoryFilter
            categories={categories}
            selectedCategories={pendingFilters.categories}
            onToggle={toggleCategory}
          />

          <Separator />

          {/* Price Filter */}
          <PriceFilter
            minPrice={0}
            maxPrice={10000000}
            currentMin={appliedFilters.priceMin}
            currentMax={appliedFilters.priceMax}
            pendingMin={pendingFilters.priceMin}
            pendingMax={pendingFilters.priceMax}
            onChange={setPriceRange}
            validationErrors={validationErrors}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              key={`search-${appliedFilters.search}`}
              value={appliedFilters.search}
              onChange={setDebouncedSearch}
              onClear={clearSearch}
            />

            <div className="flex items-center gap-2">
              <MobileFilterDrawer
                categories={categories}
                pendingCategories={pendingFilters.categories}
                pendingPriceMin={pendingFilters.priceMin}
                pendingPriceMax={pendingFilters.priceMax}
                appliedPriceMin={appliedFilters.priceMin}
                appliedPriceMax={appliedFilters.priceMax}
                minPrice={0}
                maxPrice={10000000}
                appliedFiltersCount={activeFiltersCount}
                pendingChangesCount={pendingChangesCount}
                hasPendingChanges={hasPendingChanges}
                validationErrors={validationErrors}
                onToggleCategory={toggleCategory}
                onPriceChange={setPriceRange}
                onApply={applyFilters}
                onClearPending={resetPending}
              />

              <SortDropdown
                value={currentSortValue}
                onChange={handleSortChange}
                disabled={isPending}
              />

              <div className="hidden sm:block">
                <PerPageSelector
                  value={appliedFilters.perPage}
                  onChange={handlePerPageChange}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          <ActiveFilters
            selectedCategories={appliedFilters.categories}
            priceMin={appliedFilters.priceMin}
            priceMax={appliedFilters.priceMax}
            search={appliedFilters.search}
            categories={categories}
            onClearCategory={(slug) => {
              toggleCategory(slug);
              // Use setTimeout to allow state to update before applying
              setTimeout(() => applyFilters(), 0);
            }}
            onClearPriceRange={() => {
              setPriceRange(null, null);
              setTimeout(() => applyFilters(), 0);
            }}
            onClearSearch={clearSearch}
            onClearAll={clearAllFilters}
          />

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              {isPending ? (
                "Updating..."
              ) : (
                <>
                  Showing {(pagination.page - 1) * pagination.perPage + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.perPage,
                    pagination.total
                  )}{" "}
                  of {pagination.total} products
                </>
              )}
            </span>

            <div className="sm:hidden">
              <PerPageSelector
                value={appliedFilters.perPage}
                onChange={handlePerPageChange}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Product Grid with loading overlay */}
        <div className="relative">
          {isPending && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-start justify-center pt-20">
              <div className="h-8 w-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCardShop key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-slate-900 mb-2">
                No products found
              </p>
              <p className="text-slate-500">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              disabled={isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
