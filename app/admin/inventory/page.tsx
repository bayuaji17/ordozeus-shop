import { Suspense } from "react";
import {
  getInventoryOverview,
  getInventoryHistory,
} from "@/lib/actions/inventory";
import { InventoryClient } from "@/components/admin/inventory/inventory-client";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryPageProps {
  searchParams: Promise<{
    search?: string;
    stockLevel?: "all" | "in-stock" | "low-stock" | "out-of-stock";
    productType?: "all" | "simple" | "variant";
    page?: string;
  }>;
}

async function InventoryContent({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [inventoryData, recentMovements] = await Promise.all([
    getInventoryOverview({
      search: params.search,
      stockLevel: params.stockLevel || "all",
      productType: params.productType || "all",
      page,
      limit: 20,
    }),
    getInventoryHistory(undefined, undefined, 10),
  ]);

  return (
    <InventoryClient
      items={inventoryData.items}
      pagination={inventoryData.pagination}
      recentMovements={recentMovements}
    />
  );
}

function InventoryLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-125 w-full" />
      <Skeleton className="h-125 w-full" />
    </div>
  );
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <p className="text-muted-foreground">
          Track and manage stock levels across all products
        </p>
      </div>

      <Suspense fallback={<InventoryLoading />}>
        <InventoryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
