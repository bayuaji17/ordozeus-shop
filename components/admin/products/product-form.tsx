"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ProductFormProps {
  mode: "create" | "edit";
  product?: any; // For edit mode
  categories: Category[];
}

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
  const [hasVariant, setHasVariant] = useState(product?.hasVariant ?? false);
  const [options, setOptions] = useState<ProductOptionData[]>(
    product?.options?.map((opt: any) => ({
      id: opt.id,
      name: opt.name,
      values: opt.values.map((v: any) => ({ id: v.id, value: v.value })),
    })) ?? []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.productCategories?.map((pc: any) => pc.category.id) ?? []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 0,
      status: product?.status ?? "draft",
      hasVariant: product?.hasVariant ?? false,
      stock: product?.stock ?? 0,
      categoryIds: product?.productCategories?.map((pc: any) => pc.category.id) ?? [],
      options: [],
      variants: [],
    },
  });

  const watchName = watch("name");
  const watchSlug = watch("slug");
  const watchBasePrice = watch("basePrice");

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === "create" && watchName && !watchSlug) {
      setValue("slug", generateSlug(watchName));
    }
  }, [watchName, watchSlug, mode, setValue]);

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
          index
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
    value: any
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const formData: ProductFormData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: parseInt(data.basePrice),
        status: data.status,
        hasVariant,
        categoryIds: selectedCategories,
        ...(hasVariant
          ? {
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
              stock: parseInt(data.stock),
            }),
      } as ProductFormData;

      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(product.id, formData);

      if (result.success) {
        if (mode === "create") {
          showSuccessToast.productCreated();
          router.push(`/admin/products/${result.productId}`);
        } else {
          showSuccessToast.productUpdated();
          router.push(`/admin/products/${product.id}`);
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
  const categoriesByType = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Basic T-Shirt"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="e.g., basic-t-shirt"
              className="font-mono"
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">
                {errors.slug.message as string}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Product description..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price (IDR) *</Label>
              <Input
                id="basePrice"
                type="number"
                {...register("basePrice", { valueAsNumber: true })}
                placeholder="150000"
              />
              {errors.basePrice && (
                <p className="text-sm text-destructive mt-1">
                  {errors.basePrice.message as string}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(categoriesByType).map(([type, cats]) => (
            <div key={type}>
              <p className="text-sm font-medium mb-2 capitalize">{type}</p>
              <div className="space-y-2">
                {cats.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${cat.id}`}
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <Label
                      htmlFor={`category-${cat.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {cat.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasVariant"
              checked={hasVariant}
              onCheckedChange={(checked) => {
                setHasVariant(!!checked);
                setValue("hasVariant", !!checked);
              }}
            />
            <Label htmlFor="hasVariant" className="cursor-pointer">
              This product has variants (e.g., different sizes, colors)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Simple Product: Stock */}
      {!hasVariant && (
        <Card>
          <CardHeader>
            <CardTitle>Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                placeholder="100"
                min="0"
              />
              {errors.stock && (
                <p className="text-sm text-destructive mt-1">
                  {errors.stock.message as string}
                </p>
              )}
            </div>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Product" : "Update Product"}
        </Button>
      </div>
    </form>
  );
}
