"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createCourier, updateCourier } from "@/lib/actions/couriers";
import { toast } from "sonner";
import type { CourierItem } from "./courier-list";

interface CourierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courier?: CourierItem;
  mode: "create" | "edit";
}

export function CourierFormDialog({
  open,
  onOpenChange,
  courier,
  mode,
}: CourierFormDialogProps) {
  const [name, setName] = useState(courier?.name || "");
  const [code, setCode] = useState(courier?.code || "");
  const [isActive, setIsActive] = useState(courier?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setCode("");
    setIsActive(true);
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!code.trim()) {
      newErrors.code = "Code is required";
    } else if (!/^[a-z0-9_-]+$/i.test(code)) {
      newErrors.code = "Code can only contain letters, numbers, hyphens, and underscores";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const result = await createCourier({
          name: name.trim(),
          code: code.trim(),
          isActive,
        });

        if (result.success) {
          toast.success(`Courier "${name}" created successfully`);
          resetForm();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create courier");
        }
      } else if (mode === "edit" && courier) {
        const result = await updateCourier(courier.id, {
          name: name.trim(),
          code: code.trim(),
          isActive,
        });

        if (result.success) {
          toast.success(`Courier "${name}" updated successfully`);
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update courier");
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Courier" : "Edit Courier"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new shipping courier to your store."
                : "Update the courier details."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., JNE Reguler"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                placeholder="e.g., jne"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier for API integration (lowercase)
              </p>
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Enable this courier for shipping
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
