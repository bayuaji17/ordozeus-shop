"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: {
    id: string;
    name: string;
    stock: number;
  }[];
  selectedSizeId: string | null;
  onSelect: (sizeId: string) => void;
}

export function SizeSelector({
  sizes,
  selectedSizeId,
  onSelect,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-900">Select Size</span>
        {selectedSizeId && (
          <span className="text-sm text-slate-500">
            {sizes.find((s) => s.id === selectedSizeId)?.stock} in stock
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {sizes.map((size) => {
          const isOutOfStock = size.stock === 0;
          const isSelected = selectedSizeId === size.id;

          return (
            <button
              key={size.id}
              onClick={() => !isOutOfStock && onSelect(size.id)}
              disabled={isOutOfStock}
              className={cn(
                "relative py-3 px-2 rounded-lg border-2 text-sm font-medium uppercase transition-all",
                isOutOfStock
                  ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                  : isSelected
                    ? "border-black bg-black text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-400",
              )}
            >
              {size.name}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        Some sizes may be temporarily unavailable
      </p>
    </div>
  );
}
