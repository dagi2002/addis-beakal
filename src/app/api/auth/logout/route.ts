import { NextResponse } from "next/server";

import { clearUserSession } from "@/server/auth/session";

export async function POST() {
  await clearUserSession();
  return NextResponse.json({ success: true });
}
