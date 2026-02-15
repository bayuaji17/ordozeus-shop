import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import type { FeaturedProduct } from "@/lib/actions/home";

interface ProductCardProps {
  product: FeaturedProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        
        {/* Quick View Button */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur-sm py-3 px-4 text-center text-sm font-medium shadow-lg"
          >
            View Product
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        {/* Categories */}
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.categories.slice(0, 2).map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="text-[10px] uppercase tracking-wider font-normal"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Name */}
        <h3 className="font-medium text-base leading-tight group-hover:text-primary transition-colors"
        >
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-sm font-semibold">
          {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
}

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Curated Selection
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight"
            >
              Featured Products
            </h2>
          </div>
          
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all group"
          >
            View All Products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
