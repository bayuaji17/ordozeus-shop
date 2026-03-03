import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { verifyCallbackSignature } from "@/lib/actions/ipaymu";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const isFormUrlEncoded = req.headers.get("content-type")?.includes("application/x-www-form-urlencoded");
    let body: Record<string, unknown>;

    if (isFormUrlEncoded) {
        // iPaymu sends form url encoded by default
        const formData = await req.formData();
        body = Object.fromEntries(formData.entries());
    } else {
        body = (await req.json()) as Record<string, unknown>;
    }

    // 1. Verify Signature
    // iPaymu sends signature in `X-Signature` header (not in the body)
    const headerSignature = req.headers.get("x-signature");
    const bodySignature = typeof body.signature === "string" ? body.signature : null;
    const signature = headerSignature || bodySignature;

    const isValid = verifyCallbackSignature(body, signature);
    if (!isValid) {
      console.warn("iPaymu Webhook: Invalid Signature", { signature, body });
      return new NextResponse("Invalid Signature", { status: 400 });
    }

    // 2. Extract Data
    // typical ipaymu callback data:
    // trx_id, status, status_code, sid, reference_id, signature
    const { reference_id, status_code, trx_id, sid } = body as Record<string, string>;

    if (!reference_id) {
        return new NextResponse("Missing reference_id", { status: 400 });
    }

    // status_code translation based on docs:
    // 1 => Berhasil, 6 => Berhasil Unsettled, 7 => Escrow (Let's map all successful to PAID)
    // -2 => Expired
    // 0 => Pending
    // Others => consider failed/unmapped for now 

    let newStatus: "PENDING" | "EXPIRED" | "PAID" | null = null;
    const code = Number(status_code);

    if (code === 1 || code === 6 || code === 7) {
        newStatus = "PAID";
    } else if (code === -2) {
        newStatus = "EXPIRED";
    }

    // 3. Update Order Status + iPaymu tracking fields
    if (newStatus && typeof reference_id === 'string') {
        await db.update(orders)
            .set({
              status: newStatus,
              ...(trx_id ? { ipaymuTrxId: String(trx_id) } : {}),
              ...(sid ? { ipaymuSessionId: String(sid) } : {}),
              updatedAt: new Date(),
            })
            .where(eq(orders.id, reference_id));
        console.log(`iPaymu Webhook: Order ${reference_id} marked as ${newStatus}, trx_id=${trx_id}`);
    } else {
        console.log(`iPaymu Webhook: Unknown/Ignored status_code ${status_code} for order ${reference_id}`);
    }

    // Must return 200 OK so iPaymu stops retrying
    return NextResponse.json({ status: "OK" });

  } catch (err) {
    console.error("iPaymu Webhook Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
