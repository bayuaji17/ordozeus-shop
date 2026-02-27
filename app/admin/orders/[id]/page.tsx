import { getOrderById } from "@/lib/actions/orders";
import { notFound } from "next/navigation";
import {
  OrderStatusBadge,
  OrderStatus,
} from "@/components/admin/orders/order-status-badge";
import { OrderStatusForm } from "@/components/admin/orders/order-status-form";
import { formatCurrency } from "@/lib/currency";
import Link from "next/link";
import { ArrowLeft, User, MapPin, CreditCard, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Order #{order.id}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        {item.sizeName && (
                          <div className="text-sm text-muted-foreground">
                            Size: {item.sizeName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatCurrency(order.totalAmount - order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Shipping ({order.courier || "Standard"})
                  </span>
                  <span>{formatCurrency(order.shippingCost)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm
                orderId={order.id}
                currentStatus={order.status as OrderStatus}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              <p className="text-muted-foreground">{order.customerPhone}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity}, {order.shippingProvince}{" "}
                {order.shippingPostalCode}
              </p>
              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-semibold text-slate-900">
                    Tracking Number
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5" />
                Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">iPaymu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trans. ID</span>
                <span
                  className="font-medium truncate max-w-[120px] ml-2"
                  title={order.ipaymuTrxId || "N/A"}
                >
                  {order.ipaymuTrxId || "Pending"}
                </span>
              </div>
              {order.ipaymuPaymentUrl && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={order.ipaymuPaymentUrl}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    View Payment Gateway URL &rarr;
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
