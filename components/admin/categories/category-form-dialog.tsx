"use client";

import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { generateSlug } from "@/lib/utils/slug";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CategoryImageUpload } from "@/components/admin/categories/category-image-upload";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    level: number;
    displayOrder: number;
    isActive: boolean;
    imageUrl?: string | null;
    imageKey?: string | null;
  };
  allCategories: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  mode: "create" | "edit";
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  allCategories,
  mode,
}: CategoryFormDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [imageData, setImageData] = useState<{
    url: string;
    key: string;
  } | null>(
    category?.imageUrl && category?.imageKey
      ? { url: category.imageUrl, key: category.imageKey }
      : null,
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      parentId: category?.parentId ?? null,
      displayOrder: category?.displayOrder ?? 0,
      isActive: category?.isActive ?? true,
    },
  });

  const watchName = form.watch("name");

  // Auto-generate slug from name (if not manually edited)
  useEffect(() => {
    if (watchName && !isSlugManuallyEdited) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, isSlugManuallyEdited, form]);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        parentId: category?.parentId ?? null,
        displayOrder: category?.displayOrder ?? 0,
        isActive: category?.isActive ?? true,
        imageUrl: category?.imageUrl ?? null,
        imageKey: category?.imageKey ?? null,
      });
      setIsSlugManuallyEdited(false);
      setImageData(
        category?.imageUrl && category?.imageKey
          ? { url: category.imageUrl, key: category.imageKey }
          : null,
      );
    }
  }, [open, category, form]);

  // Filter out current category from parent options (can't be parent of itself)
  const parentOptions = allCategories.filter((c) => c.id !== category?.id);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      const formData: CategoryFormData = {
        ...data,
        imageUrl: imageData?.url ?? null,
        imageKey: imageData?.key ?? null,
      };

      const result =
        mode === "create"
          ? await createCategory(formData)
          : await updateCategory(category!.id, formData);

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
        mode === "create"
          ? "Failed to create category"
          : "Failed to update category",
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
            {mode === "create" ? "Create Category" : "Edit Category"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new category to organize your products"
              : "Update category information"}
          </DialogDescription>
        </DialogHeader>

        <form
          id="category-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            {/* Category Image */}
            <Field>
              <FieldLabel>Image (optional)</FieldLabel>
              <CategoryImageUpload
                currentImage={imageData}
                onImageUploaded={(data) => {
                  setImageData(data);
                  form.setValue("imageUrl", data.url);
                  form.setValue("imageKey", data.key);
                }}
                onImageRemoved={() => {
                  setImageData(null);
                  form.setValue("imageUrl", null);
                  form.setValue("imageKey", null);
                }}
                disabled={isSubmitting}
              />
            </Field>

            {/* Category Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-name">
                    Category Name *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="category-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Casual Wear"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Slug Field */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-slug">Slug *</FieldLabel>
                  <Input
                    {...field}
                    id="category-slug"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., casual-wear"
                    className="font-mono"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      field.onChange(e);
                      setIsSlugManuallyEdited(true);
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Parent Category Field */}
            <Controller
              name="parentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-parent">
                    Parent Category
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="category-parent"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="No parent (root category)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        No parent (root category)
                      </SelectItem>
                      {parentOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {"—".repeat(cat.level - 1)} {cat.name}
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

            {/* Display Order */}
            <Controller
              name="displayOrder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-order">
                    Display Order
                  </FieldLabel>
                  <Input
                    {...field}
                    id="category-order"
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

            {/* Is Active Field */}
            <Controller
              name="isActive"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id="category-active"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                  <FieldLabel
                    htmlFor="category-active"
                    className="font-normal cursor-pointer"
                  >
                    Active (visible in product forms)
                  </FieldLabel>
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
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Category" : "Update Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
