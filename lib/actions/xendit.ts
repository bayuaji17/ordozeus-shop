import { Xendit } from "xendit-node";
import type { CreateInvoiceRequest, Invoice } from "xendit-node/invoice/models";

// ============================================================================
// XENDIT CLIENT
// ============================================================================

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN || "";

const xenditClient = new Xendit({ secretKey: XENDIT_SECRET_KEY });
const { Invoice: invoiceClient } = xenditClient;

// ============================================================================
// CREATE INVOICE
// ============================================================================

export interface XenditInvoiceParams {
  externalId: string; // Our order ID (e.g. ORD-20260304-A1B2)
  amount: number; // Total in IDR
  description: string; // Order description
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface XenditInvoiceResult {
  invoiceId: string; // Xendit internal invoice ID
  invoiceUrl: string; // Hosted payment page URL
  externalId: string;
}

/**
 * Creates a Xendit Invoice.
 * The invoice provides a hosted payment page supporting
 * credit/debit cards, e-wallets, QRIS, and Virtual Accounts.
 */
export async function createXenditInvoice(
  params: XenditInvoiceParams,
): Promise<XenditInvoiceResult> {
  const data: CreateInvoiceRequest = {
    externalId: params.externalId,
    amount: params.amount,
    description: params.description,
    currency: "IDR",
    customer: {
      givenNames: params.customerName,
      email: params.customerEmail,
      mobileNumber: params.customerPhone,
    },
    successRedirectUrl: params.successRedirectUrl,
    failureRedirectUrl: params.failureRedirectUrl,
    // Invoice expires after 24 hours (in seconds)
    invoiceDuration: 86400,
  };

  const invoice: Invoice = await invoiceClient.createInvoice({ data });

  if (!invoice.id || !invoice.invoiceUrl) {
    throw new Error("Xendit: Failed to create invoice — missing id or URL");
  }

  return {
    invoiceId: invoice.id,
    invoiceUrl: invoice.invoiceUrl,
    externalId: invoice.externalId,
  };
}

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

/**
 * Verifies the Xendit webhook callback token.
 *
 * Xendit sends a `x-callback-token` header with every webhook callback.
 * This token must match the Webhook Verification Token set in the
 * Xendit Dashboard → Settings → Callbacks.
 */
export function verifyXenditWebhookToken(
  callbackToken: string | null,
): boolean {
  if (!callbackToken || !XENDIT_WEBHOOK_TOKEN) return false;
  return callbackToken === XENDIT_WEBHOOK_TOKEN;
}
