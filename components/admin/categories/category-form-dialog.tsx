"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { categorySchema, type CategoryFormData } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { generateSlug } from "@/lib/utils/slug";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    slug: string;
    type: "man" | "woman" | "unisex";
    isActive: boolean;
  };
  mode: "create" | "edit";
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  mode,
}: CategoryFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      type: category?.type ?? "unisex",
      isActive: category?.isActive ?? true,
    },
  });

  const watchName = watch("name");
  const watchSlug = watch("slug");

  // Auto-generate slug from name (only in create mode)
  useEffect(() => {
    if (mode === "create" && watchName && !watchSlug) {
      setValue("slug", generateSlug(watchName));
    }
  }, [watchName, watchSlug, mode, setValue]);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        type: category?.type ?? "unisex",
        isActive: category?.isActive ?? true,
      });
    }
  }, [open, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      const result =
        mode === "create"
          ? await createCategory(data)
          : await updateCategory(category!.id, data);

      if (result.success) {
        if (mode === "create") {
          showSuccessToast.categoryCreated();
        } else {
          showSuccessToast.categoryUpdated();
        }
        onOpenChange(false);
        router.refresh();
      } else {
        showErrorToast.generic(result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showErrorToast.generic(
        mode === "create" ? "Failed to create category" : "Failed to update category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new category to organize your products"
              : "Update category information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Casual Wear"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="e.g., casual-wear"
              className="font-mono"
              disabled={isSubmitting}
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Gender Type *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value: "man" | "woman" | "unisex") =>
                setValue("type", value)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="man">Man</SelectItem>
                <SelectItem value="woman">Woman</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive mt-1">
                {errors.type.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible in product forms)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Category" : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
