import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { getDashboardStats, getOrderChartData } from "@/lib/actions/dashboard";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { OrdersChart } from "@/components/admin/dashboard/orders-chart";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/server";

export default async function DashboardPage() {
  await requireAdmin();
  const [stats, chartData] = await Promise.all([
    getDashboardStats(),
    getOrderChartData(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products.total}</div>
            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
              <span className="text-green-600">
                {stats.products.active} active
              </span>
              <span className="text-yellow-600">
                {stats.products.draft} draft
              </span>
              <span className="text-gray-600">
                {stats.products.archived} archived
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lowStock.count}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Items need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Status Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue (30 Days)</CardTitle>
            <CardDescription>Daily revenue from paid orders</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.lowStock.count === 0 ? (
              <p className="text-sm text-muted-foreground">
                All items are well stocked!
              </p>
            ) : (
              <div className="space-y-3">
                {stats.lowStock.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <Badge
                      variant={item.stock === 0 ? "destructive" : "secondary"}
                      className="ml-2"
                    >
                      {item.stock} left
                    </Badge>
                  </div>
                ))}
                {stats.lowStock.count > 5 && (
                  <Link
                    href="/admin/inventory"
                    className="text-xs text-primary hover:underline block text-center"
                  >
                    View all {stats.lowStock.count} items →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Orders (30 Days)</CardTitle>
          <CardDescription>Daily order count from paid orders</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersChart data={chartData} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to key areas of your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/admin/products"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary hover:bg-accent transition-colors"
            >
              <Package className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="font-medium">Manage Products</span>
              <span className="text-xs text-muted-foreground mt-1">
                {stats.products.total} products
              </span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary hover:bg-accent transition-colors"
            >
              <ShoppingCart className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="font-medium">Manage Orders</span>
              <span className="text-xs text-muted-foreground mt-1">
                View all orders
              </span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:border-primary hover:bg-accent transition-colors"
            >
              <AlertTriangle className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="font-medium">Check Inventory</span>
              <span className="text-xs text-muted-foreground mt-1">
                {stats.lowStock.count} alerts
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
