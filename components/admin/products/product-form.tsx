"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { generateSlug } from "@/lib/utils/slug";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { CategoryOption, ProductFormProduct, Size } from "@/lib/types";

interface CategoryNode {
  id: string;
  name: string;
  level: number;
  children: CategoryNode[];
}

function buildCategoryTree(categories: CategoryOption[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const cat of categories) {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      level: cat.level,
      children: [],
    });
  }
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function countSelectedInTree(node: CategoryNode, selected: string[]): number {
  let count = selected.includes(node.id) ? 1 : 0;
  for (const child of node.children) {
    count += countSelectedInTree(child, selected);
  }
  return count;
}

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductFormProduct;
  categories: CategoryOption[];
  availableSizes: Size[];
}

export function ProductForm({
  mode,
  product,
  categories,
  availableSizes,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    mode === "edit",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.productCategories?.map((pc) => pc.category.id) ?? [],
  );

  // Track selected sizes with their stock values
  const [selectedSizes, setSelectedSizes] = useState<
    Array<{ sizeId: string; sku: string; stock: number }>
  >(
    product?.sizes?.map((ps) => ({
      sizeId: ps.sizeId,
      sku: ps.sku ?? "",
      stock: ps.stock,
    })) ?? [],
  );

  // Size type selector state
  const [selectedSizeTypeId, setSelectedSizeTypeId] = useState<string>(() => {
    if (product?.sizes?.length) {
      const firstSizeId = product.sizes[0].sizeId;
      const match = availableSizes.find((s) => s.id === firstSizeId);
      return match?.sizeTypeId ?? "";
    }
    return "";
  });
  const [pendingSizeTypeId, setPendingSizeTypeId] = useState<string | null>(
    null,
  );
  const [showSizeTypeChangeAlert, setShowSizeTypeChangeAlert] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 0,
      status: product?.status ?? "draft",
      isFeatured: product?.isFeatured ?? false,
      categoryIds:
        product?.productCategories?.map((pc) => pc.category.id) ?? [],
      sizes:
        product?.sizes?.map((ps) => ({
          sizeId: ps.sizeId,
          sku: ps.sku ?? "",
          stock: ps.stock,
        })) ?? [],
    },
  });

  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === "create" && watchName && !isSlugManuallyEdited) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, isSlugManuallyEdited, form, mode]);

  // Sync selectedSizes to form
  useEffect(() => {
    form.setValue("sizes", selectedSizes, { shouldValidate: true });
  }, [selectedSizes, form]);

  // Sync selectedCategories to form
  useEffect(() => {
    form.setValue("categoryIds", selectedCategories);
  }, [selectedCategories, form]);

  // Generate SKU for a size
  const generateSKU = useCallback(
    (sizeName: string, index: number) => {
      const slug = watchSlug || "product";
      const sizeInitials = sizeName.substring(0, 3).toUpperCase();
      const paddedIndex = String(index + 1).padStart(3, "0");
      return `${slug}-${sizeInitials}-${paddedIndex}`;
    },
    [watchSlug],
  );

  // Add a size
  const addSize = useCallback(
    (sizeId: string) => {
      if (selectedSizes.some((s) => s.sizeId === sizeId)) return;

      const sizeRecord = availableSizes.find((s) => s.id === sizeId);
      if (!sizeRecord) return;

      setSelectedSizes((prev) => [
        ...prev,
        {
          sizeId,
          sku: generateSKU(sizeRecord.name, prev.length),
          stock: 0,
        },
      ]);
    },
    [selectedSizes, availableSizes, generateSKU],
  );

  // Remove a size
  const removeSize = useCallback((sizeId: string) => {
    setSelectedSizes((prev) => prev.filter((s) => s.sizeId !== sizeId));
  }, []);

  // Update size field
  const updateSizeField = useCallback(
    (sizeId: string, field: "sku" | "stock", value: string | number) => {
      setSelectedSizes((prev) =>
        prev.map((s) => (s.sizeId === sizeId ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  // Handle category toggle
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const formData: ProductFormData = {
        ...data,
        basePrice: Number(data.basePrice),
        categoryIds: selectedCategories,
        sizes: selectedSizes.map((s) => ({
          sizeId: s.sizeId,
          sku: s.sku,
          stock: Number(s.stock),
        })),
      };

      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(product!.id, formData);

      if (result.success) {
        if (mode === "create") {
          showSuccessToast.productCreated();
          router.push(`/admin/products/${result.productId}`);
        } else {
          showSuccessToast.productUpdated();
          router.push(`/admin/products/${product!.id}`);
        }
        router.refresh();
      } else {
        showErrorToast.generic(result.error);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showErrorToast.generic("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build category tree from flat list
  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  );

  // Extract unique size types from available sizes
  const sizeTypeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of availableSizes) {
      if (!map.has(s.sizeTypeId)) map.set(s.sizeTypeId, s.sizeTypeName);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [availableSizes]);

  // Sizes for the currently selected type, not yet selected
  const filteredUnselectedSizes = useMemo(() => {
    if (!selectedSizeTypeId) return [];
    return availableSizes.filter(
      (s) =>
        s.sizeTypeId === selectedSizeTypeId &&
        !selectedSizes.some((ss) => ss.sizeId === s.id),
    );
  }, [availableSizes, selectedSizeTypeId, selectedSizes]);

  // Handle size type change with confirmation
  const handleSizeTypeChange = useCallback(
    (newTypeId: string) => {
      if (selectedSizes.length > 0 && selectedSizeTypeId !== newTypeId) {
        setPendingSizeTypeId(newTypeId);
        setShowSizeTypeChangeAlert(true);
      } else {
        setSelectedSizeTypeId(newTypeId);
      }
    },
    [selectedSizes.length, selectedSizeTypeId],
  );

  const confirmSizeTypeChange = useCallback(() => {
    if (pendingSizeTypeId) {
      setSelectedSizes([]);
      setSelectedSizeTypeId(pendingSizeTypeId);
      setPendingSizeTypeId(null);
    }
    setShowSizeTypeChangeAlert(false);
  }, [pendingSizeTypeId]);

  const cancelSizeTypeChange = useCallback(() => {
    setPendingSizeTypeId(null);
    setShowSizeTypeChangeAlert(false);
  }, []);

  return (
    <form
      id="product-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {/* Product Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-name">Product Name *</FieldLabel>
                  <Input
                    {...field}
                    id="product-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Basic T-Shirt"
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Slug */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-slug">Slug *</FieldLabel>
                  <Input
                    {...field}
                    id="product-slug"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., basic-t-shirt"
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

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="product-description"
                    aria-invalid={fieldState.invalid}
                    placeholder="Product description..."
                    rows={4}
                    disabled={isSubmitting}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Base Price, Status, Featured */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="basePrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-base-price">
                      Base Price (IDR) *
                    </FieldLabel>
                    <Input
                      {...field}
                      id="product-base-price"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      placeholder="150000"
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

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-status">Status *</FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="product-status"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field orientation="horizontal" className="md:mt-8">
                <Controller
                  name="isFeatured"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="is-featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                />
                <FieldLabel
                  htmlFor="is-featured"
                  className="cursor-pointer font-normal"
                >
                  Featured Product
                </FieldLabel>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryTree.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {categoryTree.map((node) => {
                const selectedCount = countSelectedInTree(
                  node,
                  selectedCategories,
                );
                if (node.children.length === 0) {
                  return (
                    <div key={node.id} className="py-2">
                      <Field orientation="horizontal">
                        <Checkbox
                          id={`category-${node.id}`}
                          checked={selectedCategories.includes(node.id)}
                          onCheckedChange={() => toggleCategory(node.id)}
                          disabled={isSubmitting}
                        />
                        <FieldLabel
                          htmlFor={`category-${node.id}`}
                          className="font-normal cursor-pointer"
                        >
                          {node.name}
                        </FieldLabel>
                      </Field>
                    </div>
                  );
                }
                return (
                  <AccordionItem key={node.id} value={node.id}>
                    <AccordionTrigger className="py-3">
                      <span className="flex items-center gap-2">
                        {node.name}
                        {selectedCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedCount}
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <Field orientation="horizontal">
                          <Checkbox
                            id={`category-${node.id}`}
                            checked={selectedCategories.includes(node.id)}
                            onCheckedChange={() => toggleCategory(node.id)}
                            disabled={isSubmitting}
                          />
                          <FieldLabel
                            htmlFor={`category-${node.id}`}
                            className="font-normal cursor-pointer"
                          >
                            {node.name}
                          </FieldLabel>
                        </Field>
                        {node.children.map((child) => {
                          if (child.children.length === 0) {
                            return (
                              <Field
                                key={child.id}
                                orientation="horizontal"
                                className="pl-4"
                              >
                                <Checkbox
                                  id={`category-${child.id}`}
                                  checked={selectedCategories.includes(
                                    child.id,
                                  )}
                                  onCheckedChange={() =>
                                    toggleCategory(child.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <FieldLabel
                                  htmlFor={`category-${child.id}`}
                                  className="font-normal cursor-pointer"
                                >
                                  {child.name}
                                </FieldLabel>
                              </Field>
                            );
                          }
                          const childCount = countSelectedInTree(
                            child,
                            selectedCategories,
                          );
                          return (
                            <div key={child.id} className="pl-4">
                              <div className="flex items-center gap-2 py-1">
                                <Checkbox
                                  id={`category-${child.id}`}
                                  checked={selectedCategories.includes(
                                    child.id,
                                  )}
                                  onCheckedChange={() =>
                                    toggleCategory(child.id)
                                  }
                                  disabled={isSubmitting}
                                />
                                <label
                                  htmlFor={`category-${child.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {child.name}
                                </label>
                                {childCount > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {childCount}
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 pl-6">
                                {child.children.map((leaf) => (
                                  <Field key={leaf.id} orientation="horizontal">
                                    <Checkbox
                                      id={`category-${leaf.id}`}
                                      checked={selectedCategories.includes(
                                        leaf.id,
                                      )}
                                      onCheckedChange={() =>
                                        toggleCategory(leaf.id)
                                      }
                                      disabled={isSubmitting}
                                    />
                                    <FieldLabel
                                      htmlFor={`category-${leaf.id}`}
                                      className="font-normal cursor-pointer"
                                    >
                                      {leaf.name}
                                    </FieldLabel>
                                  </Field>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No categories available. Create categories first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sizes & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Sizes & Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Size type selector */}
          {sizeTypeOptions.length > 0 ? (
            <>
              <Field>
                <FieldLabel htmlFor="size-type-select">Size Type</FieldLabel>
                <Select
                  value={selectedSizeTypeId}
                  onValueChange={handleSizeTypeChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="size-type-select">
                    <SelectValue placeholder="Select size type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeTypeOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        <span className="capitalize">{opt.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Selected sizes table */}
              {selectedSizes.length > 0 && (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Size
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Stock
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSizes.map((ss) => {
                        const sizeRecord = availableSizes.find(
                          (s) => s.id === ss.sizeId,
                        );
                        return (
                          <tr
                            key={ss.sizeId}
                            className="border-b last:border-0"
                          >
                            <td className="px-4 py-2">
                              <span className="font-medium uppercase">
                                {sizeRecord?.name ?? "Unknown"}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({sizeRecord?.sizeTypeName})
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                value={ss.sku}
                                onChange={(e) =>
                                  updateSizeField(
                                    ss.sizeId,
                                    "sku",
                                    e.target.value,
                                  )
                                }
                                className="h-8 font-mono text-sm"
                                disabled={isSubmitting}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={ss.stock}
                                min={0}
                                onChange={(e) =>
                                  updateSizeField(
                                    ss.sizeId,
                                    "stock",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="h-8 w-24"
                                disabled={isSubmitting}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSize(ss.sizeId)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add size buttons - filtered by selected type */}
              {selectedSizeTypeId ? (
                filteredUnselectedSizes.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Add sizes:</p>
                    <div className="flex flex-wrap gap-1">
                      {filteredUnselectedSizes.map((size) => (
                        <Button
                          key={size.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSize(size.id)}
                          disabled={isSubmitting}
                          className="uppercase"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {size.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : selectedSizes.length > 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    All sizes of this type have been added.
                  </p>
                ) : null
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Select a size type to add sizes.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No sizes available. Create sizes in Settings first.
            </p>
          )}

          {/* Validation error for sizes */}
          {form.formState.errors.sizes && (
            <p className="text-sm text-destructive">
              {form.formState.errors.sizes.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Size type change confirmation */}
      <AlertDialog
        open={showSizeTypeChangeAlert}
        onOpenChange={setShowSizeTypeChangeAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change size type?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the size type will remove {selectedSizes.length} selected
              size{selectedSizes.length !== 1 ? "s" : ""}. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSizeTypeChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSizeTypeChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" form="product-form" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Product" : "Update Product"}
        </Button>
      </div>
    </form>
  );
}
