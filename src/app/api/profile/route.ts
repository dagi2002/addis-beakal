import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateUserDisplayName } from "@/features/profile/service";
import { getSessionActor } from "@/lib/viewer";
import { assertAuthenticated, AuthorizationError } from "@/server/auth/policies";

export async function PATCH(request: Request) {
  try {
    const actor = await getSessionActor();
    assertAuthenticated(actor);
    const user = await updateUserDisplayName(actor.userId!, await request.json());

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid profile update." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update profile." },
      { status: 400 }
    );
  }
}
