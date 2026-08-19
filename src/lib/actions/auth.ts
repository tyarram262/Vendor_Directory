"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkPassword,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  signSessionToken,
} from "@/lib/auth";

// Type-only export — erased at compile time, safe alongside "use server".
export type LoginFormState = {
  status: "idle" | "error";
  error?: string;
};

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "");
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedPassword || !secret) {
    // Misconfiguration, not a wrong password — don't blame the user's input.
    return {
      status: "error",
      error: "Admin login isn't configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.",
    };
  }

  const ok = await checkPassword(password, expectedPassword);
  if (!ok) {
    return { status: "error", error: "Incorrect password." };
  }

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = await signSessionToken(secret, expiresAt);

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });

  redirect("/admin/inquiries");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}
