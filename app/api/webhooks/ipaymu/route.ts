import crypto from "crypto";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const VA_IPAYMU = process.env.VA_IPAYMU || "";

export async function POST(req: Request) {
  try {
    // 1. Parse body (handle both JSON and URL-encoded, same as Express example)
    const isFormUrlEncoded = req.headers
      .get("content-type")
      ?.includes("application/x-www-form-urlencoded");

    let data: Record<string, unknown>;

    if (isFormUrlEncoded) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
    } else {
      data = (await req.json()) as Record<string, unknown>;
    }

    // 2. Extract and remove signature from body (per iPaymu Express example)
    const receivedSignature = data.signature;
    delete data.signature;

    if (!receivedSignature || typeof receivedSignature !== "string") {
      console.warn("iPaymu Webhook: No signature in body", data);
      return new NextResponse("Missing Signature", { status: 400 });
    }

    // 3. Sort keys alphabetically (ksort equivalent)
    const sortedKeys = Object.keys(data).sort();
    const sortedData: Record<string, unknown> = {};
    sortedKeys.forEach((key) => {
      sortedData[key] = data[key];
    });

    // 4. Generate signature: HMAC-SHA256(JSON(sortedData), VA)
    const jsonBody = JSON.stringify(sortedData);
    const calculatedSignature = crypto
      .createHmac("sha256", VA_IPAYMU)
      .update(jsonBody)
      .digest("hex");

    // 5. Compare
    if (calculatedSignature !== receivedSignature) {
      console.warn("iPaymu Webhook: Signature mismatch", {
        received: receivedSignature,
        calculated: calculatedSignature,
        body: jsonBody,
      });
      return new NextResponse("Invalid Signature", { status: 400 });
    }

    // --- Signature verified, process the callback ---

    const { reference_id, status_code, trx_id, sid } = sortedData as Record<
      string,
      string
    >;

    if (!reference_id) {
      return new NextResponse("Missing reference_id", { status: 400 });
    }

    // status_code mapping per iPaymu docs:
    // 1 => Berhasil, 6 => Berhasil Unsettled, 7 => Escrow → PAID
    // -2 => Expired
    // 0 => Pending
    let newStatus: "PENDING" | "EXPIRED" | "PAID" | null = null;
    const code = Number(status_code);

    if (code === 1 || code === 6 || code === 7) {
      newStatus = "PAID";
    } else if (code === -2) {
      newStatus = "EXPIRED";
    }

    // Update order
    if (newStatus && typeof reference_id === "string") {
      await db
        .update(orders)
        .set({
          status: newStatus,
          ...(trx_id ? { ipaymuTrxId: String(trx_id) } : {}),
          ...(sid ? { ipaymuSessionId: String(sid) } : {}),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, reference_id));
      console.log(
        `iPaymu Webhook: Order ${reference_id} marked as ${newStatus}, trx_id=${trx_id}`
      );
    } else {
      console.log(
        `iPaymu Webhook: Unknown/Ignored status_code ${status_code} for order ${reference_id}`
      );
    }

    // Must return 200 OK so iPaymu stops retrying
    return NextResponse.json({ status: "OK" });
  } catch (err) {
    console.error("iPaymu Webhook Error:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
