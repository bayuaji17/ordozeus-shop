"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  type ShippingRate,
  toggleRateActive,
  deleteShippingRate,
} from "@/lib/actions/shipping-rates";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { AddRateDialog } from "./add-rate-dialog";
import type { Courier, Province } from "@/lib/types/settings";

interface ShippingRateListProps {
  rates: ShippingRate[];
  couriers: Courier[];
  provinces: Province[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function ShippingRateList({
  rates,
  couriers,
  provinces,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  onRefresh,
}: ShippingRateListProps) {
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleActive = (id: string, isActive: boolean) => {
    startTransition(async () => {
      const result = await toggleRateActive(id, isActive);
      if (result.success) {
        toast.success(`Rate ${isActive ? "activated" : "deactivated"}`);
        onRefresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteShippingRate(deleteId);
      if (result.success) {
        toast.success("Rate deleted successfully");
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete rate");
      }
      setDeleteId(null);
    });
  };

  const getProvinceName = (provinceId: string) => {
    const province = provinces.find((p) => p.id === provinceId);
    return province?.name || provinceId;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Courier</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Est. Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No shipping rates found.
                </TableCell>
              </TableRow>
            ) : (
              rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    <div className="font-medium">{rate.courierName}</div>
                    <div className="text-xs text-muted-foreground">
                      {rate.courierCode?.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {getProvinceName(rate.destinationProvinceId)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      City: {rate.destinationCityId}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(rate.basePrice)}</TableCell>
                  <TableCell>
                    {rate.estimatedDays ? (
                      <Badge variant="secondary">
                        {rate.estimatedDays} days
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rate.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(rate.id, checked)
                        }
                        disabled={isPending}
                      />
                      <Badge variant={rate.isActive ? "default" : "secondary"}>
                        {rate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AddRateDialog
                        couriers={couriers}
                        provinces={provinces}
                        existingRate={rate}
                        onSuccess={onRefresh}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(rate.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, totalCount)} of {totalCount} rates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shipping rate? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
