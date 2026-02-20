"use client";

import { useCallback } from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { CartItemCard } from "./cart-item-card";
import { CartSummary } from "./cart-summary";
import { EmptyCart } from "./empty-cart";

export function CartContent() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSummary,
  } = useCartStore();

  const summary = getSummary();

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      return updateQuantity(itemId, quantity);
    },
    [updateQuantity]
  );

  const handleRemove = useCallback(
    (itemId: string) => {
      removeItem(itemId);
    },
    [removeItem]
  );

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h1 className="text-xl font-semibold text-slate-900">
              Shopping Cart
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {summary.totalItems} item{summary.totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <div className="px-6">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-24">
          <CartSummary summary={summary} />
        </div>
      </div>
    </div>
  );
}
