import { getOrders } from "@/lib/actions/orders";
import { OrderList } from "@/components/admin/orders/order-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | Admin",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || "1", 10);
  const { data, meta } = await getOrders(page, 10);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Orders Tracking</h2>
      </div>
      <OrderList orders={data} meta={meta} />
    </div>
  );
}
