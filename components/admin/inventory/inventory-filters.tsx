"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [stockLevel, setStockLevel] = useState(searchParams.get("stockLevel") ?? "all");
  const [productType, setProductType] = useState(searchParams.get("productType") ?? "all");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete("page");

    startTransition(() => {
      router.push(`/admin/inventory?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  const clearSearch = () => {
    setSearch("");
    updateFilters("search", "");
  };

  const hasActiveFilters =
    searchParams.get("search") ||
    (searchParams.get("stockLevel") && searchParams.get("stockLevel") !== "all") ||
    (searchParams.get("productType") && searchParams.get("productType") !== "all");

  const clearAllFilters = () => {
    setSearch("");
    setStockLevel("all");
    setProductType("all");
    startTransition(() => {
      router.push("/admin/inventory");
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, variants, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="stock-level-filter" className="text-sm mb-2 block">
            Stock Level
          </Label>
          <Select
            value={stockLevel}
            onValueChange={(value) => {
              setStockLevel(value);
              updateFilters("stockLevel", value);
            }}
          >
            <SelectTrigger id="stock-level-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="in-stock">In Stock (&gt;10)</SelectItem>
              <SelectItem value="low-stock">Low Stock (1-10)</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock (0)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="product-type-filter" className="text-sm mb-2 block">
            Product Type
          </Label>
          <Select
            value={productType}
            onValueChange={(value) => {
              setProductType(value);
              updateFilters("productType", value);
            }}
          >
            <SelectTrigger id="product-type-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="simple">Simple Products</SelectItem>
              <SelectItem value="variant">Variant Products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
