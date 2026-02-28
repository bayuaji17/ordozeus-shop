"use server";

import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/server";

// ============================================================================
// PUBLIC — used by customer-facing Confirmation Page (no admin auth required)
// ============================================================================

export interface OrderConfirmationItem {
  id: string;
  productName: string;
  sizeName: string | null;
  sku: string | null;
  price: number;
  quantity: number;
}

export interface OrderConfirmation {
  id: string;
  status: string;
  totalAmount: number;
  shippingCost: number;
  courier: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingProvince: string | null;
  shippingPostalCode: string | null;
  ipaymuPaymentUrl: string | null;
  createdAt: Date;
  items: OrderConfirmationItem[];
}

export async function getOrderForConfirmation(
  orderId: string,
): Promise<OrderConfirmation | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      sizeName: orderItems.sizeName,
      sku: orderItems.sku,
      price: orderItems.price,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    shippingCost: order.shippingCost,
    courier: order.courier ?? null,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity ?? null,
    shippingProvince: order.shippingProvince ?? null,
    shippingPostalCode: order.shippingPostalCode ?? null,
    ipaymuPaymentUrl: order.ipaymuPaymentUrl ?? null,
    createdAt: order.createdAt,
    items,
  };
}

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

export async function updateOrderStatus(
  orderId: string,
  newStatus:
    | "PENDING"
    | "EXPIRED"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "COMPLETED",
) {
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
  const allowUpdate = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
    order.status,
  );

  if (!allowUpdate) {
    return {
      success: false,
      message:
        "Order status can only be updated if payment is PAID or further along.",
    };
  }

  await db
    .update(orders)
    .set({ status: newStatus })
    .where(eq(orders.id, orderId));

  return { success: true };
}
