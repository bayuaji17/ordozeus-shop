"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/currency";
import { useCheckoutStore } from "@/lib/stores/checkout-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { BANK_ACCOUNTS } from "@/lib/types/checkout";

export default function ConfirmationPage() {
  const router = useRouter();
  const { customerInfo, paymentMethod, clearCheckout } = useCheckoutStore();
  const { getSummary, clearCart } = useCartStore();
  const summary = getSummary();
  const [orderId] = useState<string>(() =>
    `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  );

  // Redirect if no checkout data
  useEffect(() => {
    if (!customerInfo || !paymentMethod) {
      router.push("/checkout");
    }
  }, [customerInfo, paymentMethod, router]);

  const handleCopyAccount = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
  };

  const handleComplete = () => {
    clearCheckout();
    clearCart();
    router.push("/products");
  };

  if (!customerInfo || !paymentMethod) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
            Order Placed Successfully
          </h1>
          <p className="text-slate-500">
            Thank you for your order. Please complete your payment to proceed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">Order ID</span>
            <span className="font-mono font-medium">{orderId}</span>
          </div>

          <Separator className="my-4" />

          {/* Customer Info */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-slate-900">Customer Details</p>
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-900">{customerInfo.name}</p>
              <p>{customerInfo.email}</p>
              <p>{customerInfo.phone}</p>
              <p className="mt-2">{customerInfo.address}</p>
              <p>{customerInfo.city}, {customerInfo.postalCode}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Payment Method */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-900 mb-3">Payment Method</p>
            <div className="flex items-center gap-3">
              {paymentMethod === "bank_transfer" ? (
                <>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer</p>
                    <p className="text-sm text-slate-500">Manual verification required</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium">Midtrans</p>
                    <p className="text-sm text-slate-500">Online payment</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total Amount</span>
            <span className="text-2xl font-bold">{formatCurrency(summary.subtotal)}</span>
          </div>
        </div>

        {/* Payment Instructions */}
        {paymentMethod === "bank_transfer" ? (
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Bank Transfer Instructions</h2>
            <p className="text-sm text-slate-600 mb-6">
              Please transfer the exact amount to one of the following accounts:
            </p>

            <div className="space-y-4">
              {BANK_ACCOUNTS.map((account) => (
                <div
                  key={account.bank}
                  className="bg-slate-50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{account.bank}</p>
                    <p className="text-sm text-slate-600">{account.accountNumber}</p>
                    <p className="text-xs text-slate-500">{account.accountName}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyAccount(account.accountNumber)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Please include your Order ID ({orderId}) in the
                transfer description. Your order will be processed after payment
                verification.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold mb-4">Online Payment</h2>
            <p className="text-sm text-slate-600 mb-6">
              You will be redirected to Midtrans to complete your payment securely.
            </p>

            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <p className="text-sm text-blue-800">
                Supported payment methods: Credit/Debit Card, GoPay, OVO, DANA,
                QRIS, Virtual Account (BCA, BNI, Mandiri, Permata)
              </p>
            </div>

            <Button
              className="w-full bg-black text-white hover:bg-slate-800 rounded-full h-12"
              onClick={() => {
                // TODO: Integrate with Midtrans
                alert("Midtrans integration pending");
              }}
            >
              Pay with Midtrans
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full h-12"
            onClick={handleComplete}
          >
            Continue Shopping
          </Button>
          <Link href="/products" className="flex-1">
            <Button className="w-full bg-black text-white hover:bg-slate-800 rounded-full h-12">
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
