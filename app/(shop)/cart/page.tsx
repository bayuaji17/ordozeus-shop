import { Suspense } from "react";
import Link from "next/link";
import { CartContent } from "@/components/shop/cart/cart-content";
import { CartSkeleton } from "@/components/shop/cart/cart-skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | OrdoZeus",
  description: "Review your shopping cart and proceed to checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Cart</span>
        </nav>

        <Suspense fallback={<CartSkeleton />}>
          <CartContent />
        </Suspense>
      </div>
    </div>
  );
}
