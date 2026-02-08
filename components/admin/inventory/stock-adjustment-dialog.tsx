"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockAdjustmentSchema, type StockAdjustmentFormData } from "@/lib/validations/inventory";
import { adjustStock } from "@/lib/actions/inventory";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Minus, Settings } from "lucide-react";

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    productId: string;
    variantId: string | null;
    name: string;
    sku: string;
    stock: number | null;
  } | null;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  item,
}: StockAdjustmentDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"in" | "out" | "adjust">("in");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<{
    quantity: number;
    reason: string;
  }>({
    defaultValues: {
      quantity: 0,
      reason: "",
    },
  });

  const currentStock = item?.stock ?? 0;
  const quantity = watch("quantity") || 0;

  const calculateNewStock = () => {
    if (adjustmentType === "in") {
      return currentStock + Math.abs(quantity);
    } else if (adjustmentType === "out") {
      return Math.max(0, currentStock - Math.abs(quantity));
    } else {
      return Math.abs(quantity);
    }
  };

  const onSubmit = async (formData: { quantity: number; reason: string }) => {
    if (!item) return;

    setIsSubmitting(true);

    try {
      const adjustmentData: StockAdjustmentFormData = {
        productId: item.productId,
        variantId: item.variantId,
        quantity: adjustmentType === "adjust" ? formData.quantity : Math.abs(formData.quantity),
        type: adjustmentType,
        reason: formData.reason,
      };

      const result = await adjustStock(adjustmentData);

      if (result.success) {
        showSuccessToast.stockAdjusted();
        onOpenChange(false);
        reset();
        router.refresh();
      } else {
        showErrorToast.stockAdjustment(result.error);
      }
    } catch (error) {
      console.error("Stock adjustment error:", error);
      showErrorToast.stockAdjustment();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Update stock level for {item.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Stock Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{currentStock} units</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="text-sm font-mono">{item.sku}</p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div>
            <Label className="mb-2 block">Adjustment Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={adjustmentType === "in" ? "default" : "outline"}
                onClick={() => setAdjustmentType("in")}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "out" ? "default" : "outline"}
                onClick={() => setAdjustmentType("out")}
                className="w-full"
              >
                <Minus className="h-4 w-4 mr-1" />
                Remove Stock
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "adjust" ? "default" : "outline"}
                onClick={() => setAdjustmentType("adjust")}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-1" />
                Set Stock
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity">
              {adjustmentType === "in" && "Quantity to Add"}
              {adjustmentType === "out" && "Quantity to Remove"}
              {adjustmentType === "adjust" && "New Stock Level"}
            </Label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              placeholder="0"
              min="0"
              disabled={isSubmitting}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder="e.g., Received new shipment, Sold items, Stock correction..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Stock Level</p>
                <p className="text-xl font-bold">{calculateNewStock()} units</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`text-xl font-bold ${
                  calculateNewStock() > currentStock
                    ? "text-green-600"
                    : calculateNewStock() < currentStock
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}>
                  {calculateNewStock() > currentStock && "+"}
                  {calculateNewStock() - currentStock}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || quantity === 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
