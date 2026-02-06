import { db } from "./db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";

export async function checkAdminExists(): Promise<boolean> {
  const admins = await db
    .select()
    .from(user)
    .where(eq(user.role, "admin"))
    .limit(1);
  return admins.length > 0;
}

export async function getUserCount(): Promise<number> {
  const users = await db.select().from(user);
  return users.length;
}
