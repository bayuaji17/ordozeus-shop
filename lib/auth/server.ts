"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "@/lib/auth";

/**
 * Require admin role for access
 * Validates session and checks for admin role
 * Redirects to homepage if not authorized
 * @returns Session object if authorized
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}

/**
 * Require authenticated user (any role)
 * Validates session exists
 * Redirects to signin page if not authenticated
 * @returns Session object if authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return session;
}

/**
 * Get current session without redirect
 * Useful for optional auth checks
 * @returns Session or null
 */
export async function getCurrentSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
