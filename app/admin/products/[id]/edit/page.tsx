import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductById, getAllCategories } from "@/lib/actions/products";
import { getSizes } from "@/lib/actions/sizes";
import { ProductForm } from "@/components/admin/products/product-form";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/server";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditProductContent({ id }: { id: string }) {
  const [product, categories, { all: availableSizes }] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getSizes(),
  ]);

  if (!product) {
    notFound();
  }

  // Map product for form
  const productForForm = {
    ...product,
    productCategories: product.productCategories.map((pc) => ({
      category: {
        id: pc.category.id,
        name: pc.category.name,
        parentId: pc.category.parentId,
      },
    })),
    sizes: product.sizes.map((ps) => ({
      id: ps.id,
      sizeId: ps.sizeId,
      sizeName: ps.size.name,
      sizeTypeName: ps.size.sizeType.name,
      sku: ps.sku,
      stock: ps.stock,
    })),
  };

  return (
    <ProductForm
      mode="edit"
      product={productForForm}
      categories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        level: cat.level,
      }))}
      availableSizes={availableSizes}
    />
  );
}

function EditProductSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  );
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground mt-1">
          Update product information and settings
        </p>
      </div>

      <Suspense fallback={<EditProductSkeleton />}>
        <EditProductContent id={id} />
      </Suspense>
    </div>
  );
}
