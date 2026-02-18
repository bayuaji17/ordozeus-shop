"use client";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/types/shop";

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] sm:w-[180px]">
          <SelectValue placeholder="Sort by...">
            {selectedOption?.label || "Sort by..."}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
