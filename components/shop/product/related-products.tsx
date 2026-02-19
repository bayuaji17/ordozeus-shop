"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { ShopProduct } from "@/lib/types/shop";

interface RelatedProductsProps {
  products: ShopProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">You May Also Like</h2>
        <Link
          href="/products"
          className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 mb-3">
              {product.primaryImage ? (
                <Image
                  src={product.primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">No image</span>
                </div>
              )}
            </div>
            <h3 className="font-medium text-slate-900 line-clamp-1 group-hover:text-slate-700">
              {product.name}
            </h3>
            <p className="text-slate-600">{formatCurrency(product.basePrice)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
