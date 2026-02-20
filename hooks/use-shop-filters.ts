"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ShopFilters } from "@/lib/types/shop";

export function useShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const getFiltersFromURL = useCallback((): ShopFilters => {
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const priceMin = searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : null;
    const priceMax = searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : null;
    const search = searchParams.get("search") || "";
    const sortBy = (searchParams.get("sortBy") as "name" | "price" | "date") || "date";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
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

  // Get initial filters from URL
  const [filters, setFiltersState] = useState<ShopFilters>(getFiltersFromURL);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: ShopFilters) => {
      const params = new URLSearchParams();

      if (newFilters.categories.length > 0) {
        params.set("categories", newFilters.categories.join(","));
      }
      if (newFilters.priceMin !== null) {
        params.set("priceMin", newFilters.priceMin.toString());
      }
      if (newFilters.priceMax !== null) {
        params.set("priceMax", newFilters.priceMax.toString());
      }
      if (newFilters.search) {
        params.set("search", newFilters.search);
      }
      if (newFilters.sortBy !== "date") {
        params.set("sortBy", newFilters.sortBy);
      }
      if (newFilters.sortOrder !== "desc") {
        params.set("sortOrder", newFilters.sortOrder);
      }
      if (newFilters.page !== 1) {
        params.set("page", newFilters.page.toString());
      }
      if (newFilters.perPage !== 12) {
        params.set("perPage", newFilters.perPage.toString());
      }

      const queryString = params.toString();
      router.push(`/products${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Set filters and update URL
  const setFilters = useCallback(
    (updater: (prev: ShopFilters) => ShopFilters) => {
      setFiltersState((prev) => {
        const newFilters = updater(prev);
        updateURL(newFilters);
        return newFilters;
      });
    },
    [updateURL]
  );

  // Individual filter setters
  const toggleCategory = useCallback(
    (categoryId: string) => {
      setFilters((prev) => {
        const exists = prev.categories.includes(categoryId);
        const newCategories = exists
          ? prev.categories.filter((id) => id !== categoryId)
          : [...prev.categories, categoryId];
        return { ...prev, categories: newCategories, page: 1 };
      });
    },
    [setFilters]
  );

  const setPriceRange = useCallback(
    (min: number | null, max: number | null) => {
      setFilters((prev) => ({
        ...prev,
        priceMin: min,
        priceMax: max,
        page: 1,
      }));
    },
    [setFilters]
  );

  const setSearch = useCallback(
    (search: string) => {
      setFilters((prev) => ({ ...prev, search, page: 1 }));
    },
    [setFilters]
  );

  const setSort = useCallback(
    (sortBy: "name" | "price" | "date", sortOrder: "asc" | "desc") => {
      setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    [setFilters]
  );

  const setPage = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page }));
    },
    [setFilters]
  );

  const setPerPage = useCallback(
    (perPage: number) => {
      setFilters((prev) => ({ ...prev, perPage, page: 1 }));
    },
    [setFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters(() => ({
      categories: [],
      priceMin: null,
      priceMax: null,
      search: "",
      sortBy: "date",
      sortOrder: "desc",
      page: 1,
      perPage: 12,
    }));
  }, [setFilters]);

  const clearCategory = useCallback(
    (categoryId: string) => {
      setFilters((prev) => ({
        ...prev,
        categories: prev.categories.filter((id) => id !== categoryId),
        page: 1,
      }));
    },
    [setFilters]
  );

  const clearPriceRange = useCallback(() => {
    setFilters((prev) => ({ ...prev, priceMin: null, priceMax: null, page: 1 }));
  }, [setFilters]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Handle search input changes with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setDebouncedSearch(value);
      // Debounce the actual filter update
      setTimeout(() => {
        setSearch(value);
      }, 300);
    },
    [setSearch]
  );

  const activeFiltersCount =
    filters.categories.length +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0) +
    (filters.search ? 1 : 0);

  return {
    filters,
    debouncedSearch,
    setDebouncedSearch: handleSearchChange,
    toggleCategory,
    setPriceRange,
    setSearch,
    setSort,
    setPage,
    setPerPage,
    clearFilters,
    clearCategory,
    clearPriceRange,
    activeFiltersCount,
  };
}
