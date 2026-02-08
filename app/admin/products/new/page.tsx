import { Suspense } from "react";
import { getAllCategories } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/products/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

async function NewProductContent() {
  const categories = await getAllCategories();

  return (
    <ProductForm
      mode="create"
      categories={categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: cat.type,
      }))}
    />
  );
}

function NewProductSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  );
}

export default function NewProductPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Product</h1>
        <p className="text-muted-foreground mt-1">
          Add a new product to your inventory
        </p>
      </div>

      <Suspense fallback={<NewProductSkeleton />}>
        <NewProductContent />
      </Suspense>
    </div>
  );
}
