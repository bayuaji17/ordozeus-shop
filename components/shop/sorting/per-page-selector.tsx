"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PER_PAGE_OPTIONS } from "@/lib/types/shop";

interface PerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function PerPageSelector({ value, onChange }: PerPageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 hidden sm:inline">Show:</span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue>{value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PER_PAGE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option} per page
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
