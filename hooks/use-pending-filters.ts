"use client";

import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ShopFilters,
  PendingShopFilters,
  FilterValidationError,
} from "@/lib/types/shop";

export function usePendingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse applied filters from URL
  const getAppliedFilters = useCallback((): ShopFilters => {
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const priceMin = searchParams.get("priceMin")
      ? parseInt(searchParams.get("priceMin")!)
      : null;
    const priceMax = searchParams.get("priceMax")
      ? parseInt(searchParams.get("priceMax")!)
      : null;
    const search = searchParams.get("search") || "";
    const sortBy =
      (searchParams.get("sortBy") as "name" | "price" | "date") || "date";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "12");

    return {
      categories,
      priceMin,
      priceMax,
      search,
      sortBy,
      sortOrder,
      page,
      perPage,
    };
  }, [searchParams]);

  const [appliedFilters, setAppliedFilters] =
    useState<ShopFilters>(getAppliedFilters);

  // Pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<PendingShopFilters>({
    categories: appliedFilters.categories,
    priceMin: appliedFilters.priceMin,
    priceMax: appliedFilters.priceMax,
  });

  const [validationErrors, setValidationErrors] = useState<
    FilterValidationError[]
  >([]);

  // Validation logic
  const validateFilters = useCallback(
    (filters: PendingShopFilters): boolean => {
      const errors: FilterValidationError[] = [];

      if (filters.priceMin !== null && filters.priceMax !== null) {
        if (filters.priceMin > filters.priceMax) {
          errors.push({
            field: "price",
            message: "Min price must be less than max price",
          });
        }
      }

      setValidationErrors(errors);
      return errors.length === 0;
    },
    [],
  );

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    const categoriesChanged =
      pendingFilters.categories.length !== appliedFilters.categories.length ||
      pendingFilters.categories.some(
        (cat, i) => cat !== appliedFilters.categories[i],
      );

    const priceMinChanged = pendingFilters.priceMin !== appliedFilters.priceMin;
    const priceMaxChanged = pendingFilters.priceMax !== appliedFilters.priceMax;

    return categoriesChanged || priceMinChanged || priceMaxChanged;
  }, [pendingFilters, appliedFilters]);

  // Count of pending changes
  const pendingChangesCount = useMemo(() => {
    let count = 0;

    // Count category changes
    const addedCategories = pendingFilters.categories.filter(
      (cat) => !appliedFilters.categories.includes(cat),
    ).length;
    const removedCategories = appliedFilters.categories.filter(
      (cat) => !pendingFilters.categories.includes(cat),
    ).length;

    if (addedCategories > 0 || removedCategories > 0) {
      count += 1; // Count as one filter change
    }

    // Count price changes
    if (
      pendingFilters.priceMin !== appliedFilters.priceMin ||
      pendingFilters.priceMax !== appliedFilters.priceMax
    ) {
      count += 1;
    }

    return count;
  }, [pendingFilters, appliedFilters]);

  // Update pending filters
  const toggleCategory = useCallback((categorySlug: string) => {
    setPendingFilters((prev) => {
      const exists = prev.categories.includes(categorySlug);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((slug) => slug !== categorySlug)
          : [...prev.categories, categorySlug],
      };
    });
    setValidationErrors([]);
  }, []);

  const setPriceRange = useCallback(
    (min: number | null, max: number | null) => {
      setPendingFilters((prev) => ({
        ...prev,
        priceMin: min,
        priceMax: max,
      }));
      setValidationErrors([]);
    },
    [],
  );

  // Apply pending filters to URL
  const applyFilters = useCallback(() => {
    if (!validateFilters(pendingFilters)) {
      return false;
    }

    const params = new URLSearchParams();

    if (pendingFilters.categories.length > 0) {
      params.set("categories", pendingFilters.categories.join(","));
    }
    if (pendingFilters.priceMin !== null) {
      params.set("priceMin", pendingFilters.priceMin.toString());
    }
    if (pendingFilters.priceMax !== null) {
      params.set("priceMax", pendingFilters.priceMax.toString());
    }

    // Preserve search, sort, and pagination
    if (appliedFilters.search) {
      params.set("search", appliedFilters.search);
    }
    if (appliedFilters.sortBy !== "date") {
      params.set("sortBy", appliedFilters.sortBy);
    }
    if (appliedFilters.sortOrder !== "desc") {
      params.set("sortOrder", appliedFilters.sortOrder);
    }
    if (appliedFilters.page !== 1) {
      params.set("page", "1"); // Reset to page 1 when filters change
    }
    if (appliedFilters.perPage !== 12) {
      params.set("perPage", appliedFilters.perPage.toString());
    }

    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });

    // Update applied filters
    setAppliedFilters((prev) => ({
      ...prev,
      categories: pendingFilters.categories,
      priceMin: pendingFilters.priceMin,
      priceMax: pendingFilters.priceMax,
      page: 1,
    }));

    return true;
  }, [pendingFilters, appliedFilters, router, validateFilters]);

  // Reset pending to applied
  const resetPending = useCallback(() => {
    setPendingFilters({
      categories: appliedFilters.categories,
      priceMin: appliedFilters.priceMin,
      priceMax: appliedFilters.priceMax,
    });
    setValidationErrors([]);
  }, [appliedFilters]);

  // Clear all pending filters
  const clearPending = useCallback(() => {
    setPendingFilters({
      categories: [],
      priceMin: null,
      priceMax: null,
    });
    setValidationErrors([]);
  }, []);

  // For search, sort, and pagination (apply immediately)
  const setSearch = useCallback(
    (search: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
    router.push(`/products?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const setSort = useCallback(
    (sortBy: "name" | "price" | "date", sortOrder: "asc" | "desc") => {
      const params = new URLSearchParams(searchParams.toString());
      if (sortBy !== "date") {
        params.set("sortBy", sortBy);
      } else {
        params.delete("sortBy");
      }
      if (sortOrder !== "desc") {
        params.set("sortOrder", sortOrder);
      } else {
        params.delete("sortOrder");
      }
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page !== 1) {
        params.set("page", page.toString());
      } else {
        params.delete("page");
      }
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (perPage !== 12) {
        params.set("perPage", perPage.toString());
      } else {
        params.delete("perPage");
      }
      params.set("page", "1");
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Clear all applied filters
  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();

    // Keep only search, sort, perPage if they exist
    if (appliedFilters.search) params.set("search", appliedFilters.search);
    if (appliedFilters.sortBy !== "date")
      params.set("sortBy", appliedFilters.sortBy);
    if (appliedFilters.sortOrder !== "desc")
      params.set("sortOrder", appliedFilters.sortOrder);
    if (appliedFilters.perPage !== 12)
      params.set("perPage", appliedFilters.perPage.toString());

    router.push(
      `/products${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );

    setPendingFilters({
      categories: [],
      priceMin: null,
      priceMax: null,
    });

    setAppliedFilters((prev) => ({
      ...prev,
      categories: [],
      priceMin: null,
      priceMax: null,
      page: 1,
    }));
  }, [appliedFilters, router]);

  // Debounced search with proper cleanup
  const [debouncedSearch, setDebouncedSearch] = useState(appliedFilters.search);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      // Update local state immediately for UI responsiveness
      setDebouncedSearch(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }, [setSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const activeFiltersCount =
    appliedFilters.categories.length +
    (appliedFilters.priceMin !== null || appliedFilters.priceMax !== null
      ? 1
      : 0) +
    (appliedFilters.search ? 1 : 0);

  return {
    // Applied filters (from URL)
    appliedFilters,
    // Pending filters (not yet applied)
    pendingFilters,
    // Actions
    toggleCategory,
    setPriceRange,
    applyFilters,
    resetPending,
    clearPending,
    clearAllFilters,
    // Search/Sort/Pagination (immediate)
    debouncedSearch,
    setDebouncedSearch: handleSearchChange,
    setSort,
    setPage,
    setPerPage,
    // State
    hasPendingChanges,
    pendingChangesCount,
    validationErrors,
    activeFiltersCount,
  };
}
