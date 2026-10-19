"use server";

import { redirect } from "next/navigation";
import { checkCredentials, clearFailures, clientIp, endSession, isRateLimited, recordFailure, startSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (isRateLimited(ip)) return { error: "Too many failed attempts. Please wait 15 minutes and try again." };

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    recordFailure(ip);
    return { error: "Incorrect username or password." };
  }
  clearFailures(ip);
  await startSession();
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
