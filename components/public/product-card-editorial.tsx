"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { FeaturedProduct } from "@/lib/actions/home";

interface ProductCardEditorialProps {
  product: FeaturedProduct;
}

export function ProductCardEditorial({ product }: ProductCardEditorialProps) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-md h-full flex flex-col">
      <Link href={`/products/${product.slug}`} className="block flex-1">
        {/* Image Container */}
        <div className="relative aspect-4/5 overflow-hidden">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="p-4 md:p-5 flex flex-col gap-3">
        {/* Product Info */}
        <div className="space-y-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-slate-900 text-base md:text-lg font-medium leading-tight line-clamp-2 hover:text-slate-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-slate-900 text-lg font-semibold mt-2">
            {formatCurrency(product.basePrice)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-black text-white hover:bg-slate-800 rounded-lg h-10 text-xs md:text-sm font-medium tracking-wide"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Buy Now
          </Button>
          <Button
            className="w-10 h-10 p-0 bg-black text-white hover:bg-slate-800 rounded-lg shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implement add to cart
            }}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
