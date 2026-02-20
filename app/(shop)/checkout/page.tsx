import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/shop/checkout/checkout-form";
import { OrderSummarySidebar } from "@/components/shop/checkout/order-summary-sidebar";

export const metadata: Metadata = {
  title: "Checkout | OrdoZeus",
  description: "Complete your order",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/cart" className="hover:text-slate-900 transition-colors">
            Cart
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Checkout</span>
        </nav>

        {/* Checkout Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Checkout
          </h1>
          <p className="text-slate-500 mt-1">
            Fill in your details to complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <OrderSummarySidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
