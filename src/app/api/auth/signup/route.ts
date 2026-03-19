import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { signUpUser } from "@/server/auth/service";
import { startUserSession } from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const user = await signUpUser(await request.json());
    await startUserSession(user.id);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid sign-up details." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create account." },
      { status: 400 }
    );
  }
}
