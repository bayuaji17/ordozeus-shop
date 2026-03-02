import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getCategoryBySlug, getShopProducts } from "@/lib/actions/shop";
import { ProductCardShop } from "@/components/shop/product-card-shop";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} | OrdoZeus`,
    description: `Browse ${category.name} collections at OrdoZeus. Quality craftsmanship meets contemporary design.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const productsData = await getShopProducts({
    categorySlugs: [slug],
    sortBy: "date",
    sortOrder: "desc",
    page: 1,
    perPage: 8,
  });

  const { products, pagination } = productsData;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            {category.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {pagination.total} {pagination.total === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCardShop key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-slate-900 mb-2">
              No products found
            </p>
            <p className="text-slate-500">
              Check back later for new arrivals in this category.
            </p>
          </div>
        )}

        {/* View All Button */}
        {pagination.total > 8 && (
          <div className="flex justify-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href={`/products?categories=${slug}`}>
                View all {pagination.total} products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
