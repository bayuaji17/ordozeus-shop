import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use direct connection (no pgbouncer) for migrations
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
