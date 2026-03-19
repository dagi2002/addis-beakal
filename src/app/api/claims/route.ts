import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitClaim } from "@/features/claims/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const claim = await submitClaim(await request.json(), actor);

    return NextResponse.json({ claim });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid claim." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit claim." },
      { status: 400 }
    );
  }
}
