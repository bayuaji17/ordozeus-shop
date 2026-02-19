"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shop/cart/quantity-stepper";
import { SizeSelector } from "./size-selector";
import { useCartStore } from "@/lib/stores/cart-store";
import { showCartToast } from "@/lib/utils/toast";

interface AddToCartSectionProps {
  product: {
    id: string;
    slug: string;
    name: string;
    basePrice: number;
    primaryImage: string | null;
    sizes: {
      id: string;
      name: string;
      stock: number;
    }[];
  };
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const selectedSize = product.sizes.find((s) => s.id === selectedSizeId);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      showCartToast.outOfStock();
      return;
    }

    setIsAdding(true);

    const added = addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      price: product.basePrice,
      image: product.primaryImage,
      maxStock: selectedSize.stock,
      quantity,
    });

    if (added) {
      showCartToast.itemAdded(product.name);
    } else {
      showCartToast.maxStockReached();
    }

    setTimeout(() => setIsAdding(false), 500);
  }, [
    product,
    selectedSize,
    quantity,
    addItem,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!selectedSize) {
      showCartToast.outOfStock();
      return;
    }

    const added = addItem({
      productId: product.id,
      productSlug: product.slug,
      name: product.name,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      price: product.basePrice,
      image: product.primaryImage,
      maxStock: selectedSize.stock,
      quantity,
    });

    if (added) {
      showCartToast.itemAdded(product.name);
      router.push("/cart");
    } else {
      showCartToast.maxStockReached();
    }
  }, [
    product,
    selectedSize,
    quantity,
    addItem,
    router,
  ]);

  return (
    <div className="space-y-6">
      <SizeSelector
        sizes={product.sizes}
        selectedSizeId={selectedSizeId}
        onSelect={setSelectedSizeId}
      />

      {selectedSize && (
        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-900">Quantity</span>
          <QuantityStepper
            quantity={quantity}
            onIncrease={() => setQuantity((q) => Math.min(q + 1, selectedSize.stock))}
            onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
            maxStock={selectedSize.stock}
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-black text-white hover:bg-slate-800 rounded-full h-12 text-base font-medium"
          onClick={handleAddToCart}
          disabled={!selectedSize || isAdding}
        >
          {isAdding ? (
            <>
              <Check className="h-5 w-5 mr-2" />
              Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-full h-12 text-base font-medium border-2"
          onClick={handleBuyNow}
          disabled={!selectedSize}
        >
          Buy Now
        </Button>
      </div>

      {!selectedSize && (
        <p className="text-sm text-slate-500 text-center">
          Please select a size to continue
        </p>
      )}
    </div>
  );
}
