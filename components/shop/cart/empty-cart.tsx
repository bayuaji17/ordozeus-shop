"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <ShoppingBag className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-slate-500 mb-8 max-w-sm">
        Looks like you haven&apos;t added anything to your cart yet. Explore our products and find something you like.
      </p>
      <Link href="/products">
        <Button className="bg-black text-white hover:bg-slate-800 rounded-full px-8">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
}
