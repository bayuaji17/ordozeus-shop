"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FilterValidationError } from "@/lib/types/shop";

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  currentMin: number | null;
  currentMax: number | null;
  onChange: (min: number | null, max: number | null) => void;
  validationErrors?: FilterValidationError[];
}

export function PriceFilter({
  minPrice = 0,
  maxPrice = 10000000,
  currentMin,
  currentMax,
  onChange,
  validationErrors = [],
}: PriceFilterProps) {
  const [localMin, setLocalMin] = useState(currentMin?.toString() ?? "");
  const [localMax, setLocalMax] = useState(currentMax?.toString() ?? "");

  const priceError = validationErrors.find((err) => err.field === "price");

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d*$/.test(value)) {
      setLocalMin(value);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d*$/.test(value)) {
      setLocalMax(value);
    }
  };

  const handleMinBlur = () => {
    const numValue = localMin === "" ? null : parseInt(localMin);
    
    // Validate: min should be >= global min and <= max
    if (numValue !== null) {
      const maxValue = currentMax ?? maxPrice;
      if (numValue < minPrice) {
        setLocalMin(minPrice.toString());
        onChange(minPrice, currentMax);
        return;
      }
      if (numValue > maxValue) {
        // Don't auto-correct, let validation handle it
        onChange(numValue, currentMax);
        return;
      }
    }
    
    onChange(numValue, currentMax);
  };

  const handleMaxBlur = () => {
    const numValue = localMax === "" ? null : parseInt(localMax);
    
    // Validate: max should be <= global max and >= min
    if (numValue !== null) {
      const minValue = currentMin ?? minPrice;
      if (numValue > maxPrice) {
        setLocalMax(maxPrice.toString());
        onChange(currentMin, maxPrice);
        return;
      }
      if (numValue < minValue) {
        // Don't auto-correct, let validation handle it
        onChange(currentMin, numValue);
        return;
      }
    }
    
    onChange(currentMin, numValue);
  };

  // Update local state when props change
  if (currentMin?.toString() !== localMin && !(currentMin === null && localMin === "")) {
    setLocalMin(currentMin?.toString() ?? "");
  }
  if (currentMax?.toString() !== localMax && !(currentMax === null && localMax === "")) {
    setLocalMax(currentMax?.toString() ?? "");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Price Range</h3>
      </div>

      {/* Price Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label htmlFor="price-min" className="text-xs text-slate-500 mb-1.5 block">
            Min
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              Rp
            </span>
            <Input
              id="price-min"
              type="text"
              inputMode="numeric"
              placeholder={minPrice.toString()}
              value={localMin}
              onChange={handleMinChange}
              onBlur={handleMinBlur}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        <span className="text-slate-400 mt-6">—</span>

        <div className="flex-1">
          <Label htmlFor="price-max" className="text-xs text-slate-500 mb-1.5 block">
            Max
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              Rp
            </span>
            <Input
              id="price-max"
              type="text"
              inputMode="numeric"
              placeholder={maxPrice.toString()}
              value={localMax}
              onChange={handleMaxChange}
              onBlur={handleMaxBlur}
              className="pl-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {priceError && (
        <p className="text-sm text-red-500 mt-2">{priceError.message}</p>
      )}

      {/* Price Range Info */}
      <div className="flex justify-between text-xs text-slate-500 pt-1">
        <span>Min: Rp {minPrice.toLocaleString("id-ID")}</span>
        <span>Max: Rp {maxPrice.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
