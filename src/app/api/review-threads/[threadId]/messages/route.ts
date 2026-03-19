import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { addReviewThreadMessage } from "@/features/owner/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ threadId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { threadId } = await context.params;
    const thread = await addReviewThreadMessage(threadId, await request.json(), actor);

    return NextResponse.json({ thread });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send message." },
      { status: 400 }
    );
  }
}
