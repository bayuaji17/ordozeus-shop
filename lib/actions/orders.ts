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
  xenditInvoiceUrl: string | null;
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
    xenditInvoiceUrl: order.xenditInvoiceUrl ?? null,
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

// Allowed transitions: PAID→PROCESSING, SHIPPED→DELIVERED, DELIVERED→COMPLETED
const ALLOWED_TRANSITIONS: Record<string, string> = {
  PAID: "PROCESSING",
  SHIPPED: "DELIVERED",
  DELIVERED: "COMPLETED",
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: "PROCESSING" | "DELIVERED" | "COMPLETED",
) {
  await requireAdmin();

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  const expectedNext = ALLOWED_TRANSITIONS[order.status];
  if (!expectedNext || expectedNext !== newStatus) {
    return {
      success: false,
      message: `Cannot transition from ${order.status} to ${newStatus}.`,
    };
  }

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return { success: true };
}

/**
 * Ship an order: sets tracking number + courier and transitions PROCESSING → SHIPPED.
 */
export async function shipOrder(
  orderId: string,
  trackingNumber: string,
  courierId: string,
) {
  await requireAdmin();

  if (!trackingNumber.trim()) {
    return { success: false, message: "Tracking number is required." };
  }
  if (!courierId.trim()) {
    return { success: false, message: "Courier is required." };
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  });

  if (!order) {
    return { success: false, message: "Order not found" };
  }

  if (order.status !== "PROCESSING") {
    return {
      success: false,
      message: `Cannot ship order. Current status is ${order.status}, expected PROCESSING.`,
    };
  }

  // Look up courier name
  const { couriers } = await import("@/lib/db/schema");
  const courier = await db.query.couriers.findFirst({
    where: eq(couriers.id, courierId),
  });

  if (!courier) {
    return { success: false, message: "Courier not found." };
  }

  await db
    .update(orders)
    .set({
      status: "SHIPPED",
      trackingNumber: trackingNumber.trim(),
      courier: courier.name,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  return { success: true };
}
