"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  maxStock: number;
  minQuantity?: number;
}

export function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  maxStock,
  minQuantity = 1,
}: QuantityStepperProps) {
  const canDecrease = quantity > minQuantity;
  const canIncrease = quantity < maxStock;

  return (
    <div className="flex items-center border rounded-lg w-fit mt-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-r-none"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-10 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-l-none"
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
