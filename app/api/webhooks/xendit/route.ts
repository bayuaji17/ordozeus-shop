import { db } from "@/lib/db";
import { orders, orderItems, productSizes, inventoryMovements } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyXenditWebhookToken } from "@/lib/actions/xendit";


export async function POST(req: Request) {
  try {
    // 1. Verify webhook token
    const callbackToken = req.headers.get("x-callback-token");
    if (!verifyXenditWebhookToken(callbackToken)) {
      console.warn("[Xendit Webhook] Invalid callback token");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse body
    const data = (await req.json()) as Record<string, unknown>;

    // Gracefully ignore non-invoice webhooks (e.g. payment.capture from Payment Request API)
    if (data.event && typeof data.event === "string") {
      console.log(`[Xendit Webhook] Ignored non-invoice event: ${data.event}`);
      return NextResponse.json({ status: "OK" });
    }

    const externalId = data.external_id as string | undefined;
    const xenditStatus = data.status as string | undefined;
    const xenditInvoiceId = data.id as string | undefined;

    if (!externalId) {
      console.warn("[Xendit Webhook] Missing external_id");
      return new NextResponse("Missing external_id", { status: 400 });
    }

    // 3. Map Xendit status → order status
    let newStatus: "PENDING" | "EXPIRED" | "PAID" | null = null;

    if (xenditStatus === "PAID" || xenditStatus === "SETTLED") {
      newStatus = "PAID";
    } else if (xenditStatus === "EXPIRED") {
      newStatus = "EXPIRED";
    }

    // 4. Update order + deduct stock (in transaction if PAID)
    if (newStatus === "PAID") {
      await db.transaction(async (tx) => {
        // Update order status
        const result = await tx
          .update(orders)
          .set({
            status: "PAID",
            ...(xenditInvoiceId
              ? { xenditInvoiceId: String(xenditInvoiceId) }
              : {}),
            updatedAt: new Date(),
          })
          .where(eq(orders.id, externalId))
          .returning({ id: orders.id, status: orders.status });

        if (result.length === 0) {
          console.warn(`[Xendit Webhook] Order ${externalId} not found in DB`);
          return;
        }

        // Fetch order items
        const items = await tx
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            productSizeId: orderItems.productSizeId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, externalId));

        // Deduct stock + create inventory movements for each item with a size
        for (const item of items) {
          if (item.productSizeId) {
            // Decrement stock
            await tx
              .update(productSizes)
              .set({
                stock: sql`${productSizes.stock} - ${item.quantity}`,
              })
              .where(eq(productSizes.id, item.productSizeId));

            // Create inventory movement record
            await tx.insert(inventoryMovements).values({
              productId: item.productId,
              productSizeId: item.productSizeId,
              type: "out",
              quantity: item.quantity,
              reason: `Order ${externalId}`,
            });
          }
        }

        console.log(
          `[Xendit Webhook] Order ${externalId} → PAID, stock deducted for ${items.length} item(s)`,
        );
      });
    } else if (newStatus) {
      // Non-PAID status updates (e.g. EXPIRED) — no stock changes
      const result = await db
        .update(orders)
        .set({
          status: newStatus,
          ...(xenditInvoiceId
            ? { xenditInvoiceId: String(xenditInvoiceId) }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, externalId))
        .returning({ id: orders.id, status: orders.status });

      if (result.length > 0) {
        console.log(`[Xendit Webhook] Order ${externalId} → ${newStatus}`);
      } else {
        console.warn(`[Xendit Webhook] Order ${externalId} not found in DB`);
      }
    } else {
      console.log(`[Xendit Webhook] Ignored status "${xenditStatus}" for ${externalId}`);
    }

    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("[Xendit Webhook] Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

