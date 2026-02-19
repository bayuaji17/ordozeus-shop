"use client";

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "./quantity-stepper";
import { formatCurrency } from "@/lib/currency";
import type { CartItem } from "@/lib/types/cart";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => boolean;
  onRemove: (itemId: string) => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [item.id, item.quantity, onUpdateQuantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-slate-100 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/products/${item.productSlug}`}
        className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-400 text-xs">No image</span>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.productSlug}`}
              className="font-medium text-slate-900 hover:text-slate-700 transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <p className="text-sm text-slate-500 mt-1">
              Size: <span className="font-medium uppercase">{item.sizeName}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
            onClick={handleRemove}
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <QuantityStepper
            quantity={item.quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            maxStock={item.maxStock}
          />
          <div className="text-right">
            <p className="font-semibold text-slate-900">
              {formatCurrency(itemTotal)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-slate-500">
                {formatCurrency(item.price)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
