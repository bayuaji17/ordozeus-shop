import { Suspense } from "react";
import { getAllCategories } from "@/lib/actions/products";
import { getSizes } from "@/lib/actions/sizes";
import { ProductForm } from "@/components/admin/products/product-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/server";

async function NewProductContent() {
  const [categories, { all: availableSizes }] = await Promise.all([
    getAllCategories(),
    getSizes(),
  ]);

  return (
    <ProductForm
      mode="create"
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

function NewProductSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  );
}

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild className="w-fit" variant={"ghost"}>
          <Link href="/admin/products">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Product</h1>
          <p className="text-muted-foreground mt-1">
            Add a new product to your inventory
          </p>
        </div>
      </div>

      <Suspense fallback={<NewProductSkeleton />}>
        <NewProductContent />
      </Suspense>
    </div>
  );
}
