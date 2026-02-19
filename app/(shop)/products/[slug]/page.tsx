import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/shop";
import { ProductGallery } from "@/components/shop/product/product-gallery";
import { AddToCartSection } from "@/components/shop/product/add-to-cart-section";
import { RelatedProducts } from "@/components/shop/product/related-products";
import { ProductDetailSkeleton } from "@/components/shop/product/product-detail-skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | OrdoZeus",
    };
  }

  return {
    title: `${product.name} | OrdoZeus`,
    description: product.description || `Shop ${product.name} at OrdoZeus`,
    openGraph: {
      images: product.primaryImage ? [product.primaryImage] : [],
    },
  };
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products with categories
  const related = await getRelatedProducts(product.id, product.categories, 4);

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-slate-900 transition-colors"
        >
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-50">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <ProductGallery
          images={
            product.images.length > 0
              ? product.images
              : product.primaryImage
                ? [
                    {
                      id: "default",
                      url: product.primaryImage,
                      altText: product.name,
                      isPrimary: true,
                    },
                  ]
                : []
          }
          productName={product.name}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(product.basePrice)}
            </p>
          </div>

          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map((category) => (
                <span
                  key={category}
                  className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <Separator />

          {product.description && (
            <div className="prose prose-sm max-w-none text-slate-600">
              <p>{product.description}</p>
            </div>
          )}

          <AddToCartSection
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              basePrice: product.basePrice,
              primaryImage: product.primaryImage,
              sizes: product.sizes,
            }}
          />
        </div>
      </div>

      <RelatedProducts products={related} />
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductContent slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}
