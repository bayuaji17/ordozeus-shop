"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InventoryTable } from "@/components/admin/inventory/inventory-table";
import { InventoryFilters } from "@/components/admin/inventory/inventory-filters";
import { StockAdjustmentDialog } from "@/components/admin/inventory/stock-adjustment-dialog";
import { InventoryHistory } from "@/components/admin/inventory/inventory-history";
import { Pagination } from "@/components/admin/pagination";

interface InventoryItem {
  id: string;
  productId: string;
  productSizeId: string;
  name: string;
  sku: string | null;
  stock: number;
  status: string;
  sizeInfo: string;
  sizeType: string;
}

interface InventoryMovement {
  id: string;
  productId: string;
  productSizeId: string | null;
  type: "in" | "out" | "adjust";
  quantity: number;
  reason: string | null;
  createdAt: Date;
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

interface InventoryClientProps {
  items: InventoryItem[];
  pagination: Pagination;
  recentMovements: InventoryMovement[];
}

export function InventoryClient({
  items,
  pagination,
  recentMovements,
}: InventoryClientProps) {
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setAdjustDialogOpen(open);
    if (!open) {
      setSelectedItem(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              {pagination.total} item{pagination.total !== 1 ? "s" : ""} in
              inventory
            </CardDescription>
            <div className="pt-4">
              <InventoryFilters />
            </div>
          </CardHeader>
          <CardContent>
            <InventoryTable items={items} onAdjustStock={handleAdjustStock} />
          </CardContent>
        </Card>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          basePath="/admin/inventory"
        />

        {recentMovements.length > 0 && (
          <InventoryHistory movements={recentMovements} />
        )}
      </div>

      <StockAdjustmentDialog
        open={adjustDialogOpen}
        onOpenChange={handleDialogClose}
        item={selectedItem}
      />
    </>
  );
}
