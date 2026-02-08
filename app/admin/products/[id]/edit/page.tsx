import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductById, getAllCategories } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/products/product-form";
import { Skeleton } from "@/components/ui/skeleton";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function EditProductContent({ id }: { id: string }) {
  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      categories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
      }))}
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

export default async function EditProductPage({ params }: EditProductPageProps) {
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
