import { NextResponse } from "next/server";
import { checkAdminExists } from "@/lib/auth-utils";

export async function GET() {
  try {
    const adminExists = await checkAdminExists();
    return NextResponse.json({ adminExists });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check admin status" },
      { status: 500 }
    );
  }
}
