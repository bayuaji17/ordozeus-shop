"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import type { ShopProduct } from "@/lib/types/shop";

interface ProductCardShopProps {
  product: ShopProduct;
}

export function ProductCardShop({ product }: ProductCardShopProps) {
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"buy" | "cart" | null>(null);

  const handleActionClick = (type: "buy" | "cart") => {
    setActionType(type);
    setShowSizeSelector(true);
  };

  const handleClose = () => {
    setShowSizeSelector(false);
    setSelectedSize(null);
    setActionType(null);
  };

  const handleConfirm = () => {
    if (!selectedSize) return;

    if (actionType === "buy") {
      // TODO: Navigate to checkout with selected size
      console.log("Buy now:", product.id, "size:", selectedSize);
    } else {
      // TODO: Add to cart with selected size
      console.log("Add to cart:", product.id, "size:", selectedSize);
    }

    handleClose();
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 5) return `${stock} left`;
    return "In Stock";
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-500";
    if (stock <= 5) return "text-amber-500";
    return "text-green-600";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md h-full flex flex-col">
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block flex-1">
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
          <p className="text-slate-900 text-lg font-semibold">
            {formatCurrency(product.basePrice)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-black text-white hover:bg-slate-800 rounded-full h-10 text-xs md:text-sm font-medium tracking-wide"
            onClick={() => handleActionClick("buy")}
          >
            Buy Now
          </Button>
          <Button
            className="w-10 h-10 p-0 bg-black text-white hover:bg-slate-800 rounded-full shrink-0"
            onClick={() => handleActionClick("cart")}
            aria-label="Add to cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slide-Up Size Selector */}
      {showSizeSelector && (
        <div className="absolute inset-x-0 bottom-0 bg-white border-t border-slate-200 shadow-lg z-20 animate-slide-up">
          <div className="p-4 md:p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Select Size</h4>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Close size selector"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Product Preview */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                {product.primaryImage && (
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {product.name}
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(product.basePrice)}
                </p>
              </div>
            </div>

            {/* Size Options */}
            <RadioGroup
              value={selectedSize || ""}
              onValueChange={setSelectedSize}
              className="grid grid-cols-4 gap-2"
            >
              {product.sizes.map((size) => {
                const isOutOfStock = size.stock === 0;
                return (
                  <div key={size.id} className="relative">
                    <RadioGroupItem
                      value={size.id}
                      id={size.id}
                      disabled={isOutOfStock}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={size.id}
                      className={`
                        flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          isOutOfStock
                            ? "border-slate-200 bg-slate-50 opacity-50 grayscale cursor-not-allowed"
                            : "border-slate-200 hover:border-slate-300 peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{size.name}</span>
                      <span
                        className={`text-xs mt-0.5 ${isOutOfStock ? "text-red-500" : getStockColor(size.stock)}`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : getStockLabel(size.stock)}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-black text-white hover:bg-slate-800 rounded-full h-11 text-sm font-medium"
                disabled={!selectedSize}
                onClick={handleConfirm}
              >
                {actionType === "buy" ? "Buy Now" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when size selector is open */}
      {showSizeSelector && (
        <div
          className="absolute inset-0 bg-black/20 z-10"
          onClick={handleClose}
        />
      )}
    </div>
  );
}
