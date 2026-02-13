import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProducts } from "@/lib/actions/products";
import { ProductFilters } from "@/components/admin/products/product-filters";
import { ProductList } from "@/components/admin/products/product-list";
import { Pagination } from "@/components/admin/pagination";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: "draft" | "active" | "archived" | "all";
    stockLevel?: "all" | "in_stock" | "low_stock" | "out_of_stock";
    sortBy?: "name" | "price" | "stock" | "created";
    sortOrder?: "asc" | "desc";
    page?: string;
  }>;
}

function ProductsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-100 w-full" />
    </div>
  );
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const { products, pagination } = await getProducts({
    search: params.search,
    status: params.status || "all",
    stockLevel: params.stockLevel || "all",
    sortBy: params.sortBy || "created",
    sortOrder: params.sortOrder || "desc",
    page,
    limit: 10,
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} in
            your store
          </CardDescription>
          <div className="pt-4">
            <ProductFilters />
          </div>
        </CardHeader>
        <CardContent>
          <ProductList products={products} />
        </CardContent>
      </Card>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        basePath="/admin/products"
      />
    </>
  );
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ProductsLoading />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
