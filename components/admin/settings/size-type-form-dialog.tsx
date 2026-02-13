"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  sizeTypeSchema,
  type SizeTypeFormData,
} from "@/lib/validations/size-type";
import { createSizeType, updateSizeType } from "@/lib/actions/size-types";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SizeTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeType?: {
    id: string;
    name: string;
    sortOrder: number;
  };
  mode: "create" | "edit";
}

export function SizeTypeFormDialog({
  open,
  onOpenChange,
  sizeType,
  mode,
}: SizeTypeFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SizeTypeFormData>({
    resolver: zodResolver(sizeTypeSchema),
    defaultValues: {
      name: sizeType?.name ?? "",
      sortOrder: sizeType?.sortOrder ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: sizeType?.name ?? "",
        sortOrder: sizeType?.sortOrder ?? 0,
      });
    }
  }, [open, sizeType, form]);

  const onSubmit = async (data: SizeTypeFormData) => {
    setIsSubmitting(true);

    try {
      const result =
        mode === "create"
          ? await createSizeType(data)
          : await updateSizeType(sizeType!.id, data);

      if (result.success) {
        if (mode === "create") {
          showSuccessToast.sizeTypeCreated();
        } else {
          showSuccessToast.sizeTypeUpdated();
        }
        onOpenChange(false);
        router.refresh();
      } else {
        showErrorToast.generic(result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showErrorToast.generic(
        mode === "create"
          ? "Failed to create size type"
          : "Failed to update size type",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Size Type" : "Edit Size Type"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new size type (e.g., Clothing, Shoes)"
              : "Update size type information"}
          </DialogDescription>
        </DialogHeader>

        <form
          id="size-type-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="size-type-name">Name *</FieldLabel>
                  <Input
                    {...field}
                    id="size-type-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Clothing, Shoes"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Sort Order Field */}
            <Controller
              name="sortOrder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="size-type-sort-order">
                    Sort Order *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="size-type-sort-order"
                    type="number"
                    min={0}
                    aria-invalid={fieldState.invalid}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="size-type-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Add Type" : "Update Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
