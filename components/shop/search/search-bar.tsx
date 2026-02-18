"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  // Local state for responsive input while debouncing URL updates
  const [inputValue, setInputValue] = useState(value);

  // Sync local state when external value changes (e.g., clearing filters)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setInputValue("");
    // Use onClear for immediate clear action, fallback to onChange
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="text"
        placeholder="Search products..."
        value={inputValue}
        onChange={handleChange}
        className="pl-10 pr-10 w-full"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  );
}
