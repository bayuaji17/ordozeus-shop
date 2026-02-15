import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/products";
import { ProductDetailHeader } from "@/components/admin/products/product-detail-header";
import { ProductDetailInfo } from "@/components/admin/products/product-detail-info";
import { ProductImagesGallery } from "@/components/admin/products/product-images-gallery";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { ProductImageFull } from "@/lib/types";
import { requireAdmin } from "@/lib/auth/server";

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ProductDetailContent({ id }: { id: string }) {
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Map sizes for display
  const sizesForDisplay = product.sizes.map((ps) => ({
    id: ps.id,
    sizeId: ps.sizeId,
    sizeName: ps.size.name,
    sizeTypeName: ps.size.sizeType.name,
    sku: ps.sku,
    stock: ps.stock,
  }));

  return (
    <div className="space-y-6">
      <ProductDetailHeader
        product={{
          id: product.id,
          name: product.name,
          status: product.status,
        }}
      />

      <Separator />

      <ProductDetailInfo
        product={{
          ...product,
          productCategories: product.productCategories.map((pc) => ({
            category: {
              id: pc.category.id,
              name: pc.category.name,
              parentId: pc.category.parentId,
            },
          })),
          sizes: sizesForDisplay,
        }}
      />

      <Separator />

      <ProductImagesGallery
        productId={product.id}
        initialImages={(product.images || []) as ProductImageFull[]}
      />
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  return (
    <div className="p-6">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailContent id={id} />
      </Suspense>
    </div>
  );
}
