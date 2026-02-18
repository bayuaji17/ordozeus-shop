"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FilterValidationError } from "@/lib/types/shop";

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  currentMin: number | null;
  currentMax: number | null;
  pendingMin: number | null;
  pendingMax: number | null;
  onChange: (min: number | null, max: number | null) => void;
  validationErrors?: FilterValidationError[];
}

export function PriceFilter({
  minPrice = 0,
  maxPrice = 10000000,
  currentMin,
  currentMax,
  pendingMin,
  pendingMax,
  onChange,
  validationErrors = [],
}: PriceFilterProps) {
  const priceError = validationErrors.find((err) => err.field === "price");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Price Range</h3>
      </div>

      {/* Price Inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label
            htmlFor="price-min"
            className="text-xs text-slate-500 mb-1.5 block"
          >
            Min
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              Rp
            </span>
            <PriceInput
              key={`min-${currentMin ?? 'empty'}`}
              id="price-min"
              initialValue={currentMin}
              placeholder={minPrice.toString()}
              onChange={(value) => onChange(value, pendingMax ?? currentMax)}
              onBlur={(value) => {
                if (value !== null) {
                  const maxValue = pendingMax ?? currentMax ?? maxPrice;
                  if (value < minPrice) {
                    onChange(minPrice, pendingMax ?? currentMax);
                    return;
                  }
                  if (value > maxValue) {
                    onChange(value, pendingMax ?? currentMax);
                    return;
                  }
                }
                onChange(value, pendingMax ?? currentMax);
              }}
            />
          </div>
        </div>

        <span className="text-slate-400 mt-6">—</span>

        <div className="flex-1">
          <Label
            htmlFor="price-max"
            className="text-xs text-slate-500 mb-1.5 block"
          >
            Max
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              Rp
            </span>
            <PriceInput
              key={`max-${currentMax ?? 'empty'}`}
              id="price-max"
              initialValue={currentMax}
              placeholder={maxPrice.toString()}
              onChange={(value) => onChange(pendingMin ?? currentMin, value)}
              onBlur={(value) => {
                if (value !== null) {
                  const minValue = pendingMin ?? currentMin ?? minPrice;
                  if (value > maxPrice) {
                    onChange(pendingMin ?? currentMin, maxPrice);
                    return;
                  }
                  if (value < minValue) {
                    onChange(pendingMin ?? currentMin, value);
                    return;
                  }
                }
                onChange(pendingMin ?? currentMin, value);
              }}
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

// Self-contained input component that manages its own state
// Uses key prop to reset when initialValue changes from parent
function PriceInput({
  id,
  initialValue,
  placeholder,
  onChange,
  onBlur,
}: {
  id: string;
  initialValue: number | null;
  placeholder: string;
  onChange?: (value: number | null) => void;
  onBlur?: (value: number | null) => void;
}) {
  const [value, setValue] = useState(initialValue?.toString() ?? "");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "" || /^\d*$/.test(newValue)) {
      setValue(newValue);
      // Immediately notify parent on every keystroke for pending state
      if (onChange) {
        const numValue = newValue === "" ? null : parseInt(newValue);
        onChange(numValue);
      }
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    const numValue = value === "" ? null : parseInt(value);
    onBlur?.(numValue);
  }, [value, onBlur]);

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="pl-9 text-sm"
    />
  );
}
