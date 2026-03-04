import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  CircleCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { getOrderForConfirmation } from "@/lib/actions/orders";
import { BANK_ACCOUNTS } from "@/lib/types/checkout";
import { CopyButton } from "@/components/shop/checkout/copy-button";

export const metadata: Metadata = {
  title: "Order Confirmation | OrdoZeus",
  description: "Your order has been placed",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Awaiting Payment",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: <Clock className="h-4 w-4" />,
  },
  PAID: {
    label: "Payment Confirmed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CircleCheck className="h-4 w-4" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    icon: <CircleCheck className="h-4 w-4" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: <CircleCheck className="h-4 w-4" />,
  },
  EXPIRED: {
    label: "Expired",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <Clock className="h-4 w-4" />,
  },
};

interface PageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/checkout");
  }

  const order = await getOrderForConfirmation(orderId);

  if (!order) {
    redirect("/checkout");
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const subtotal = order.totalAmount - order.shippingCost;
  const isPending = order.status === "PENDING";

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-slate-500">
            Thank you, <strong>{order.customerName}</strong>. Please complete
            your payment to process your order.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mb-6">
          {/* Order ID + Status */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Order ID</p>
              <p className="font-mono font-semibold text-slate-900 text-lg">
                {order.id}
              </p>
            </div>
            <Badge
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${status.color}`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <Separator className="mb-6" />

          {/* Product Items */}
          <div className="space-y-4 mb-6">
            <p className="text-sm font-semibold text-slate-900">
              Order Items ({order.items.length})
            </p>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {item.productName}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {item.sizeName && (
                      <span className="text-xs text-slate-500 bg-slate-200 rounded px-1.5 py-0.5">
                        {item.sizeName}
                      </span>
                    )}
                    {item.sku && (
                      <span className="text-xs text-slate-400">
                        SKU: {item.sku}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="mb-6" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                Shipping{order.courier ? ` (${order.courier})` : ""}
              </span>
              <span className="font-medium">
                {order.shippingCost === 0
                  ? "Free"
                  : formatCurrency(order.shippingCost)}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900">Total Payment</span>
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Shipping Address
          </h2>
          <div className="text-sm text-slate-600 space-y-0.5">
            <p>{order.shippingAddress}</p>
            {order.shippingCity && (
              <p>
                {order.shippingCity}
                {order.shippingProvince ? `, ${order.shippingProvince}` : ""}
              </p>
            )}
            {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
          </div>
        </div>

        {/* Payment Section — only shown while PENDING */}
        {isPending && (
          <>
            {/* Xendit Online Payment */}
            {order.xenditInvoiceUrl && (
              <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 md:p-8 mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  Pay Online via Xendit
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Powered by Xendit — supports credit/debit cards, e-wallets
                  (GoPay, OVO, DANA, ShopeePay), QRIS, and Virtual Accounts.
                </p>

                <a href={order.xenditInvoiceUrl} className="block">
                  <Button className="w-full bg-black text-white hover:bg-slate-700 rounded-full h-12 text-base font-medium flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Pay {formatCurrency(order.totalAmount)} with Xendit
                  </Button>
                </a>

                <p className="text-xs text-slate-400 text-center mt-3">
                  You will be redirected to the Xendit secure payment page.
                </p>
              </div>
            )}

            {/* Manual Bank Transfer */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold">
                  Or Pay via Bank Transfer
                </h2>
                <Badge
                  variant="outline"
                  className="text-xs text-slate-500 border-slate-200"
                >
                  Manual
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Transfer the exact amount to one of the accounts below. After
                payment, keep your receipt for verification.
              </p>

              <div className="space-y-3">
                {BANK_ACCOUNTS.map((account) => (
                  <div
                    key={account.bank}
                    className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {account.bank}
                      </p>
                      <p className="text-sm text-slate-700 font-mono">
                        {account.accountNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        a.n. {account.accountName}
                      </p>
                    </div>
                    <CopyButton value={account.accountNumber} />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Include your Order ID{" "}
                  <span className="font-mono font-bold">{order.id}</span> in the
                  transfer description / berita. Your order will be processed
                  after manual payment verification (1×24 hours).
                </p>
              </div>
            </div>
          </>
        )}

        {/* Paid / No payment required message */}
        {!isPending && order.status === "PAID" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 mb-6 flex items-center gap-3">
            <CircleCheck className="h-6 w-6 text-green-600 shrink-0" />
            <p className="text-sm text-green-800">
              <strong>Payment confirmed!</strong> Your order is now being
              processed and will be shipped soon.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/products" className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-full h-12 border-slate-300"
            >
              Continue Shopping
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full bg-black text-white hover:bg-slate-800 rounded-full h-12">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
