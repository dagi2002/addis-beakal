import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { reviewClaim } from "@/features/claims/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type ClaimRouteContext = {
  params: Promise<{ claimId: string }>;
};

export async function POST(request: Request, context: ClaimRouteContext) {
  try {
    const actor = await getSessionActor();
    const { claimId } = await context.params;
    const claim = await reviewClaim(claimId, await request.json(), actor);

    return NextResponse.json({ claim });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid claim decision." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update claim." },
      { status: 400 }
    );
  }
}
