import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { startReviewThread } from "@/features/owner/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { reviewId } = await context.params;
    const thread = await startReviewThread(reviewId, await request.json(), actor);

    return NextResponse.json({ thread });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid thread." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not start private thread." },
      { status: 400 }
    );
  }
}
