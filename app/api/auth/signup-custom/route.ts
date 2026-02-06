import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Check if any users exist
    const users = await db.select().from(user);
    const isFirstUser = users.length === 0;

    // Return whether this will be the first user (admin)
    return NextResponse.json({ isFirstUser, email });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to check user status" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Update user to admin role
    await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
