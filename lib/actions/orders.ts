"use server";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/server";

export async function getOrders(page: number = 1, limit: number = 10) {
  await requireAdmin();

  const offset = (page - 1) * limit;

  const data = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit,
    offset,
  });

  const totalRecordsResult = await db.select({ value: count() }).from(orders);
  const totalRecords = totalRecordsResult[0].value;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data,
    meta: {
      page,
      limit,
      totalRecords,
      totalPages,
    },
  };
}

export async function getOrderById(orderId: string) {
  await requireAdmin();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: true,
    },
  });

  return order;
}

export async function updateOrderStatus(orderId: string, newStatus: "PENDING" | "EXPIRED" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED") {
  await requireAdmin();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  // ONLY allow updates if the current status is PAID, PROCESSING, SHIPPED, or DELIVERED.
  // Based on the user instruction "for upate order will enable if status payment is paid".
  // This usually means once they hit PAID, the system lets admins move it forward.
  const allowUpdate = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);
  
  if (!allowUpdate) {
     return { success: false, message: "Order status can only be updated if payment is PAID or further along." };
  }

  await db.update(orders)
    .set({ status: newStatus })
    .where(eq(orders.id, orderId));

  return { success: true };
}
