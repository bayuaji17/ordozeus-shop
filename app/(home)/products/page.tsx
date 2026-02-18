import { Suspense } from "react";
import Link from "next/link";
import { getShopProducts, getCategoriesWithCounts } from "@/lib/actions/shop";
import { ProductsContent } from "@/components/shop/products/products-content";
import { ProductsSkeleton } from "@/components/shop/products/products-skeleton";

interface ProductsPageProps {
  searchParams: Promise<{
    categories?: string;
    priceMin?: string;
    priceMax?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
    perPage?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  // Parse filters from URL
  const filters = {
    categorySlugs: params.categories?.split(",").filter(Boolean) || [],
    priceMin: params.priceMin ? parseInt(params.priceMin) : null,
    priceMax: params.priceMax ? parseInt(params.priceMax) : null,
    search: params.search || "",
    sortBy: (params.sortBy as "name" | "price" | "date") || "date",
    sortOrder: (params.sortOrder as "asc" | "desc") || "desc",
    page: Math.max(1, parseInt(params.page || "1")),
    perPage: Math.max(1, parseInt(params.perPage || "12")),
  };

  // Fetch data in parallel
  const [productsData, categories] = await Promise.all([
    getShopProducts(filters),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Products</span>
        </nav>

        <Suspense fallback={<ProductsSkeleton />}>
          <ProductsContent
            initialProducts={productsData}
            categories={categories}
          />
        </Suspense>
      </div>
    </div>
  );
}
