import { trackOrder, type TrackOrderResult } from "@/lib/actions/orders";
import {
  OrderStatusBadge,
  type OrderStatus,
} from "@/components/shared/order-status-badge";
import { OrderStatusTimeline } from "@/components/shared/order-status-timeline";
import { formatCurrency } from "@/lib/currency";
import { Package, MapPin, Search, PackageX, User } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order | OrdoZeus",
  description: "Track your order status by entering your Order ID.",
};

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.orderId?.trim() || "";
  let order: TrackOrderResult | null = null;
  let searched = false;

  if (orderId) {
    searched = true;
    order = await trackOrder(orderId);
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Track Your Order
        </h1>
        <p className="text-muted-foreground">
          Enter your Order ID to check the current status of your order.
        </p>
      </div>

      {/* Search Form */}
      <form
        action="/track-order"
        method="GET"
        className="max-w-md mx-auto mb-10"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            name="orderId"
            placeholder="e.g. ORD-20260305-0001"
            defaultValue={orderId}
            className="flex-1"
            required
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Track
          </Button>
        </div>
      </form>

      {/* Results */}
      {searched && !order && (
        <div className="max-w-md mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <PackageX className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">Order Not Found</h3>
              <p className="text-sm text-muted-foreground">
                No order found with ID{" "}
                <span className="font-mono font-semibold">{orderId}</span>.
                <br />
                Please check your Order ID and try again.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {order && <OrderDetails order={order} />}
    </div>
  );
}

function OrderDetails({ order }: { order: TrackOrderResult }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Order #{order.id}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="sm:ml-auto">
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
      </div>

      {/* Status Timeline */}
      <OrderStatusTimeline currentStatus={order.status as OrderStatus} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Order Items */}
        <div className="md:col-span-2">
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
        </div>

        {/* Right: Customer + Shipping Details */}
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
                <div className="mt-4 pt-4 border-t space-y-2">
                  {order.courier && (
                    <>
                      <p className="font-semibold text-slate-900">Courier</p>
                      <p className="text-muted-foreground">
                        {order.courier.toUpperCase()}
                      </p>
                    </>
                  )}
                  <p className="font-semibold text-slate-900">
                    Tracking Number
                  </p>
                  <p className="text-muted-foreground font-mono">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
