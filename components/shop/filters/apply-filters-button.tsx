"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ApplyFiltersButtonProps {
  pendingChangesCount: number;
  hasPendingChanges: boolean;
  onApply: () => void;
  disabled?: boolean;
}

export function ApplyFiltersButton({
  pendingChangesCount,
  hasPendingChanges,
  onApply,
  disabled = false,
}: ApplyFiltersButtonProps) {
  return (
    <Button
      onClick={onApply}
      disabled={disabled || !hasPendingChanges}
      className="w-full bg-black text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Filter className="h-4 w-4 mr-2" />
      Apply Filters
      {pendingChangesCount > 0 && (
        <Badge 
          variant="secondary" 
          className="ml-2 bg-white/20 text-white hover:bg-white/20"
        >
          {pendingChangesCount}
        </Badge>
      )}
    </Button>
  );
}
