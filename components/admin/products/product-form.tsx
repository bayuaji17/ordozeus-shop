"use client";

import { useState, useEffect, useMemo } from "react";
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
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ProductOptionsBuilder,
  type ProductOptionData,
} from "./product-options-builder";
import {
  VariantPreviewTable,
  type VariantPreviewData,
} from "./variant-preview-table";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { generateSlug } from "@/lib/utils/slug";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: "man" | "woman" | "unisex";
}

interface ProductOptionValue {
  id: string;
  value: string;
}

interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

interface ProductCategory {
  category: {
    id: string;
    name: string;
    type: "man" | "woman" | "unisex";
  };
}

interface ExistingProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  status: "draft" | "active" | "archived";
  hasVariant: boolean;
  stock: number | null;
  options?: ProductOption[];
  productCategories?: ProductCategory[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ExistingProduct;
  categories: Category[];
}

// Form value types that match the discriminated union schema
type SimpleProductFormValues = {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  status?: "draft" | "active" | "archived";
  hasVariant: false;
  stock: number;
  categoryIds?: string[];
};

type VariantProductFormValues = {
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  status?: "draft" | "active" | "archived";
  hasVariant: true;
  categoryIds?: string[];
  options: {
    id?: string;
    name: string;
    values: {
      id?: string;
      value: string;
    }[];
  }[];
  variants: {
    id?: string;
    sku: string;
    price: number;
    stock: number;
    optionValueIds: string[];
    isActive?: boolean;
  }[];
};

type FormValues = SimpleProductFormValues | VariantProductFormValues;

// Helper to generate cartesian product
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const [first, ...rest] = arrays;
  const restProduct = cartesianProduct(rest);

  return first.flatMap((item) => restProduct.map((prod) => [item, ...prod]));
}

// Helper to generate SKU
function generateSKU(slug: string, values: string[], index: number): string {
  const initials = values
    .map((val) => val.substring(0, 2).toUpperCase())
    .join("");
  const paddedIndex = String(index + 1).padStart(3, "0");
  return `${slug}-${initials}-${paddedIndex}`;
}

export function ProductForm({ mode, product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [hasVariant, setHasVariant] = useState(product?.hasVariant ?? false);
  const [options, setOptions] = useState<ProductOptionData[]>(
    product?.options?.map((opt) => ({
      id: opt.id,
      name: opt.name,
      values: opt.values.map((v) => ({ id: v.id, value: v.value })),
    })) ?? [],
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.productCategories?.map((pc) => pc.category.id) ?? [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 0,
      status: product?.status ?? "draft",
      hasVariant: product?.hasVariant ?? false,
      stock: product?.stock ?? 0,
      categoryIds:
        product?.productCategories?.map((pc) => pc.category.id) ?? [],
      options: [],
      variants: [],
    },
  });

  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");
  const watchBasePrice = form.watch("basePrice");

  // Reset slug auto-generation behavior when form mode/product changes
  useEffect(() => {
    setIsSlugManuallyEdited(false);
  }, [mode, product?.id]);

  // Auto-generate slug from name (until slug is manually edited)
  useEffect(() => {
    if (watchName && !isSlugManuallyEdited) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, isSlugManuallyEdited, form]);

  // Generate variants when options change
  const generatedVariants = useMemo(() => {
    if (!hasVariant || options.length === 0) return [];

    // Filter out empty values
    const validOptions = options
      .filter((opt) => opt.name.trim())
      .map((opt) => ({
        ...opt,
        values: opt.values.filter((v) => v.value.trim()),
      }))
      .filter((opt) => opt.values.length >= 2);

    if (validOptions.length === 0) return [];

    // Generate combinations
    const valueArrays = validOptions.map((opt) => opt.values);
    const combinations = cartesianProduct(valueArrays);

    // Create variant data
    return combinations.map((combo, index) => {
      const combinationText = combo
        .map((val, idx) => `${validOptions[idx].name}: ${val.value}`)
        .join(" • ");

      return {
        sku: generateSKU(
          watchSlug || "product",
          combo.map((v) => v.value),
          index,
        ),
        price: watchBasePrice || 0,
        stock: 0,
        optionValueIds: combo.map((v) => v.id || ""),
        combination: combinationText,
        isActive: true,
      };
    });
  }, [hasVariant, options, watchSlug, watchBasePrice]);

  const [variants, setVariants] = useState<VariantPreviewData[]>([]);

  // Update variants when generated variants change
  useEffect(() => {
    setVariants(generatedVariants);
  }, [generatedVariants]);

  const handleVariantChange = (
    index: number,
    field: keyof VariantPreviewData,
    value: string | number | boolean,
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // Create formData based on discriminated union
      const formData: ProductFormData = hasVariant
        ? {
            name: data.name,
            slug: data.slug,
            description: data.description,
            basePrice: parseInt(String(data.basePrice)),
            status: data.status ?? "draft",
            hasVariant: true,
            categoryIds: selectedCategories,
            options: options.map((opt) => ({
              name: opt.name,
              values: opt.values.map((v) => ({ value: v.value })),
            })),
            variants: variants.map((v) => ({
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              optionValueIds: v.optionValueIds,
              isActive: v.isActive,
            })),
          }
        : {
            name: data.name,
            slug: data.slug,
            description: data.description,
            basePrice: parseInt(String(data.basePrice)),
            status: data.status ?? "draft",
            hasVariant: false,
            categoryIds: selectedCategories,
            stock: "stock" in data ? parseInt(String(data.stock)) : 0,
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

  // Group categories by type
  const categoriesByType = categories.reduce(
    (acc, cat) => {
      if (!acc[cat.type]) acc[cat.type] = [];
      acc[cat.type].push(cat);
      return acc;
    },
    {} as Record<string, Category[]>,
  );

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

            {/* Base Price and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoriesByType).map(([type, cats]) => (
            <FieldSet key={type}>
              <FieldLegend variant="label" className="capitalize">
                {type}
              </FieldLegend>
              <FieldGroup data-slot="checkbox-group">
                {cats.map((cat) => (
                  <Field key={cat.id} orientation="horizontal">
                    <Checkbox
                      id={`category-${cat.id}`}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                      disabled={isSubmitting}
                    />
                    <FieldLabel
                      htmlFor={`category-${cat.id}`}
                      className="font-normal cursor-pointer"
                    >
                      {cat.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No categories available. Create categories first.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Product Type Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Product Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <Checkbox
              id="hasVariant"
              checked={hasVariant}
              onCheckedChange={(checked) => {
                setHasVariant(!!checked);
                form.setValue("hasVariant", !!checked);
              }}
              disabled={isSubmitting}
            />
            <FieldLabel
              htmlFor="hasVariant"
              className="cursor-pointer font-normal"
            >
              This product has variants (e.g., different sizes, colors)
            </FieldLabel>
          </Field>
        </CardContent>
      </Card>

      {/* Simple Product: Stock */}
      {!hasVariant && (
        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-stock">
                    Stock Quantity *
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-stock"
                    type="number"
                    aria-invalid={fieldState.invalid}
                    placeholder="100"
                    min="0"
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>
      )}

      {/* Variant Product: Options & Variants */}
      {hasVariant && (
        <>
          <ProductOptionsBuilder options={options} onChange={setOptions} />
          <VariantPreviewTable
            variants={variants}
            basePrice={watchBasePrice || 0}
            onVariantChange={handleVariantChange}
          />
        </>
      )}

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
