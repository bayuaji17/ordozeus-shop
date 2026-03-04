import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyXenditWebhookToken } from "@/lib/actions/xendit";

/**
 * Xendit Invoice Webhook Handler
 *
 * Xendit sends a POST request when an invoice status changes.
 * The callback body contains the invoice details including
 * `external_id` (our orderId) and `status`.
 *
 * Xendit Invoice statuses:
 * - PAID      → Customer paid successfully
 * - EXPIRED   → Invoice expired without payment
 *
 * Docs: https://docs.xendit.co/api-reference#invoice-callback
 */
export async function POST(req: Request) {
  try {
    // 1. Verify webhook token
    const callbackToken = req.headers.get("x-callback-token");
    if (!verifyXenditWebhookToken(callbackToken)) {
      console.warn("Xendit Webhook: Invalid callback token");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse body
    const data = (await req.json()) as Record<string, unknown>;

    const externalId = data.external_id as string | undefined;
    const xenditStatus = data.status as string | undefined;
    const xenditInvoiceId = data.id as string | undefined;

    if (!externalId) {
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
    if (newStatus && typeof externalId === "string") {
      await db
        .update(orders)
        .set({
          status: newStatus,
          ...(xenditInvoiceId
            ? { xenditInvoiceId: String(xenditInvoiceId) }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, externalId));

      console.log(
        `Xendit Webhook: Order ${externalId} marked as ${newStatus}, invoice_id=${xenditInvoiceId}`
      );
    } else {
      console.log(
        `Xendit Webhook: Ignored status "${xenditStatus}" for order ${externalId}`
      );
    }

    // Must return 200 OK so Xendit stops retrying
    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("Xendit Webhook Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
