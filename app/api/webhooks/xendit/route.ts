import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    // 4. Update order
    if (newStatus) {
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
