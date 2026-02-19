"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import type { CartSummary as CartSummaryType } from "@/lib/types/cart";

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  summary,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  // Flat shipping rate - could be dynamic based on location
  const shipping = summary.subtotal > 500000 ? 0 : 25000;
  const total = summary.subtotal + shipping;
  const freeShippingThreshold = 500000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);

  return (
    <div className="bg-slate-50 rounded-2xl p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-slate-900 mb-6">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal ({summary.totalItems} items)</span>
          <span className="font-medium text-slate-900">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-medium text-slate-900">
            {shipping === 0 ? "Free" : formatCurrency(shipping)}
          </span>
        </div>

        {remainingForFreeShipping > 0 && (
          <p className="text-sm text-slate-500">
            Add {formatCurrency(remainingForFreeShipping)} more for free shipping
          </p>
        )}

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-slate-900">Total</span>
          <span className="text-xl font-bold text-slate-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <Button
        className="w-full mt-6 bg-black text-white hover:bg-slate-800 rounded-full h-12 text-base font-medium"
        onClick={onCheckout}
        disabled={isLoading || summary.itemCount === 0}
      >
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Shipping & taxes calculated at checkout
      </p>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <Link
          href="/products"
          className="block text-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
