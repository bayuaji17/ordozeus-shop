"use client";

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import { useCartStore } from "@/lib/stores/cart-store";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function OrderSummarySidebar() {
  const { items, getSummary } = useCartStore();
  const summary = getSummary();
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 rounded-2xl p-6 lg:p-8">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between lg:hidden mb-4"
      >
        <div>
          <span className="text-sm text-slate-500">Order Summary</span>
          <span className="ml-2 font-semibold">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{formatCurrency(summary.subtotal)}</span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Items List - Always visible on desktop, toggleable on mobile */}
      <div
        className={`space-y-4 ${isExpanded ? "block" : "hidden lg:block"}`}
      >
        <div className="max-h-64 overflow-y-auto space-y-4 pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">Size: {item.sizeName}</p>
                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        {/* Totals */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Shipping</span>
            <span className="text-slate-500">Calculated at next step</span>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-xl font-bold">{formatCurrency(summary.subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
