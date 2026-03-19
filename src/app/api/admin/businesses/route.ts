import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { saveBusiness } from "@/features/businesses/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const business = await saveBusiness(await request.json(), actor);

    return NextResponse.json({ business });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid business payload." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create business." },
      { status: 400 }
    );
  }
}
