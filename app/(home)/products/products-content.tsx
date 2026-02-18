"use client";

import { usePendingFilters } from "@/lib/hooks/use-pending-filters";
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
  const {
    appliedFilters,
    pendingFilters,
    toggleCategory,
    setPriceRange,
    applyFilters,
    resetPending,
    clearAllFilters,
    debouncedSearch,
    setDebouncedSearch,
    setSort,
    setPage,
    setPerPage,
    hasPendingChanges,
    pendingChangesCount,
    validationErrors,
    activeFiltersCount,
  } = usePendingFilters();

  const { products, pagination } = initialProducts;

  const handleSortChange = (value: string) => {
    const option = SORT_OPTIONS.find((opt) => opt.value === value);
    if (option) {
      setSort(option.sortBy, option.sortOrder);
    }
  };

  const currentSortValue =
    SORT_OPTIONS.find(
      (option) =>
        option.sortBy === appliedFilters.sortBy && option.sortOrder === appliedFilters.sortOrder
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

          {/* Price Filter - Manual range, no server fetch */}
          <PriceFilter
            minPrice={0}
            maxPrice={10000000}
            currentMin={pendingFilters.priceMin}
            currentMax={pendingFilters.priceMax}
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
              value={debouncedSearch}
              onChange={setDebouncedSearch}
            />

            <div className="flex items-center gap-2">
              <MobileFilterDrawer
                categories={categories}
                pendingCategories={pendingFilters.categories}
                pendingPriceMin={pendingFilters.priceMin}
                pendingPriceMax={pendingFilters.priceMax}
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
              />

              <div className="hidden sm:block">
                <PerPageSelector
                  value={appliedFilters.perPage}
                  onChange={setPerPage}
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
            onClearCategory={(id) => {
              // Toggle to remove from applied
              toggleCategory(id);
              applyFilters();
            }}
            onClearPriceRange={() => {
              setPriceRange(null, null);
              applyFilters();
            }}
            onClearSearch={() => setDebouncedSearch("")}
            onClearAll={clearAllFilters}
          />

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {(pagination.page - 1) * pagination.perPage + 1} -{" "}
              {Math.min(
                pagination.page * pagination.perPage,
                pagination.total
              )}{" "}
              of {pagination.total} products
            </span>

            <div className="sm:hidden">
              <PerPageSelector
                value={appliedFilters.perPage}
                onChange={setPerPage}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
