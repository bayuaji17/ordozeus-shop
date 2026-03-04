ALTER TABLE "orders" RENAME COLUMN "ipaymu_session_id" TO "xendit_invoice_id";
ALTER TABLE "orders" RENAME COLUMN "ipaymu_trx_id" TO "xendit_external_id";
ALTER TABLE "orders" RENAME COLUMN "ipaymu_payment_url" TO "xendit_invoice_url";
