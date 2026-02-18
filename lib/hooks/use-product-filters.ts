"use client";

import {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  ShopFilters,
  PendingShopFilters,
  FilterValidationError,
} from "@/lib/types/shop";

const DEBOUNCE_MS = 500;

export function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Parse applied filters from URL - memoized to avoid re-parsing
  const appliedFilters = useMemo<ShopFilters>((): ShopFilters => {
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

  // Pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<PendingShopFilters>(() => {
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const priceMin = searchParams.get("priceMin")
      ? parseInt(searchParams.get("priceMin")!)
      : null;
    const priceMax = searchParams.get("priceMax")
      ? parseInt(searchParams.get("priceMax")!)
      : null;
    return { categories, priceMin, priceMax };
  });

  const [validationErrors, setValidationErrors] = useState<
    FilterValidationError[]
  >([]);

  // Track search input locally for UI responsiveness, synced with URL
  const [searchInput, setSearchInput] = useState(appliedFilters.search);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromUrlRef = useRef(false);

  // Sync search input when URL changes from external sources (clear button, back button)
  useEffect(() => {
    if (!isUpdatingFromUrlRef.current && appliedFilters.search !== searchInput) {
      isUpdatingFromUrlRef.current = true;
      setSearchInput(appliedFilters.search);
      // Reset flag after state update is scheduled
      setTimeout(() => {
        isUpdatingFromUrlRef.current = false;
      }, 0);
    }
  }, [appliedFilters.search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Validation logic
  const validateFilters = useCallback(
    (filters: PendingShopFilters): boolean => {
      if (
        filters.priceMin !== null &&
        filters.priceMax !== null &&
        filters.priceMin > filters.priceMax
      ) {
        setValidationErrors([
          { field: "price", message: "Min price must be less than max price" },
        ]);
        return false;
      }
      setValidationErrors([]);
      return true;
    },
    []
  );

  // Check if there are pending changes - use Set for O(1) lookups
  const hasPendingChanges = useMemo(() => {
    const appliedSet = new Set(appliedFilters.categories);
    const pendingSet = new Set(pendingFilters.categories);

    if (appliedSet.size !== pendingSet.size) return true;

    for (const cat of appliedSet) {
      if (!pendingSet.has(cat)) return true;
    }

    return (
      pendingFilters.priceMin !== appliedFilters.priceMin ||
      pendingFilters.priceMax !== appliedFilters.priceMax
    );
  }, [pendingFilters, appliedFilters]);

  // Count of pending changes
  const pendingChangesCount = useMemo(() => {
    let count = 0;

    const appliedSet = new Set(appliedFilters.categories);
    const pendingSet = new Set(pendingFilters.categories);

    let hasCategoryChanges = false;
    if (appliedSet.size !== pendingSet.size) {
      hasCategoryChanges = true;
    } else {
      for (const cat of appliedSet) {
        if (!pendingSet.has(cat)) {
          hasCategoryChanges = true;
          break;
        }
      }
    }

    if (hasCategoryChanges) count += 1;

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
    []
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
    if (appliedFilters.perPage !== 12) {
      params.set("perPage", appliedFilters.perPage.toString());
    }
    // Reset to page 1 when filters change
    if (appliedFilters.page !== 1) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    });

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

  // Clear all filters
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

    startTransition(() => {
      router.push(
        `/products${params.toString() ? `?${params.toString()}` : ""}`,
        { scroll: false }
      );
    });

    setPendingFilters({
      categories: [],
      priceMin: null,
      priceMax: null,
    });
  }, [appliedFilters, router]);

  // Debounced search - updates URL after DEBOUNCE_MS delay
  const handleSearchChange = useCallback(
    (value: string) => {
      // Update local state immediately for UI responsiveness
      setSearchInput(value);
      isUpdatingFromUrlRef.current = false;

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
          params.set("search", value.trim());
        } else {
          params.delete("search");
        }
        params.set("page", "1");

        startTransition(() => {
          router.push(`/products?${params.toString()}`, { scroll: false });
        });
      }, DEBOUNCE_MS);
    },
    [router, searchParams]
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = appliedFilters.categories.length;
    if (appliedFilters.priceMin !== null || appliedFilters.priceMax !== null) {
      count += 1;
    }
    if (appliedFilters.search) {
      count += 1;
    }
    return count;
  }, [appliedFilters]);

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
    clearAllFilters,
    // Search
    debouncedSearch: searchInput,
    setDebouncedSearch: handleSearchChange,
    // State
    hasPendingChanges,
    pendingChangesCount,
    validationErrors,
    activeFiltersCount,
    isPending,
  };
}
