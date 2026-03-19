import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { assignBusinessOwner } from "@/features/admin/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const business = await assignBusinessOwner(await request.json(), actor);

    return NextResponse.json({ business });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid owner assignment." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not assign owner." },
      { status: 400 }
    );
  }
}
