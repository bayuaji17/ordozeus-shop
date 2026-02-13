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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { sizeSchema, type SizeFormData } from "@/lib/validations/size";
import { createSize, updateSize } from "@/lib/actions/sizes";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SizeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: {
    id: string;
    name: string;
    sizeTypeId: string;
    sortOrder: number;
  };
  sizeTypes: { id: string; name: string }[];
  mode: "create" | "edit";
}

export function SizeFormDialog({
  open,
  onOpenChange,
  size,
  sizeTypes,
  mode,
}: SizeFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SizeFormData>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: size?.name ?? "",
      sizeTypeId: size?.sizeTypeId ?? "",
      sortOrder: size?.sortOrder ?? 0,
    },
  });

  // Reset form when dialog opens/closes or size changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: size?.name ?? "",
        sizeTypeId: size?.sizeTypeId ?? "",
        sortOrder: size?.sortOrder ?? 0,
      });
    }
  }, [open, size, form]);

  const onSubmit = async (data: SizeFormData) => {
    setIsSubmitting(true);

    try {
      const result =
        mode === "create"
          ? await createSize(data)
          : await updateSize(size!.id, data);

      if (result.success) {
        if (mode === "create") {
          showSuccessToast.sizeCreated();
        } else {
          showSuccessToast.sizeUpdated();
        }
        onOpenChange(false);
        router.refresh();
      } else {
        showErrorToast.generic(result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showErrorToast.generic(
        mode === "create" ? "Failed to create size" : "Failed to update size",
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
            {mode === "create" ? "Add Size" : "Edit Size"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new size to the master list"
              : "Update size information"}
          </DialogDescription>
        </DialogHeader>

        <form
          id="size-form"
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
                  <FieldLabel htmlFor="size-name">Name *</FieldLabel>
                  <Input
                    {...field}
                    id="size-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., S, M, L, 42"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Type Field (Select) */}
            <Controller
              name="sizeTypeId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="size-type">Type *</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="size-type"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FieldLabel htmlFor="size-sort-order">
                    Sort Order *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="size-sort-order"
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
          <Button type="submit" form="size-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Add Size" : "Update Size"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
