import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  createOwnerReply,
  removeOwnerReply,
  updateOwnerReply
} from "@/features/owner/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { reviewId } = await context.params;
    const reply = await createOwnerReply(reviewId, await request.json(), actor);

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid owner reply." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create owner reply." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { reviewId } = await context.params;
    const reply = await updateOwnerReply(reviewId, await request.json(), actor);

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid owner reply." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update owner reply." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { reviewId } = await context.params;
    await removeOwnerReply(reviewId, actor);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not remove owner reply." },
      { status: 400 }
    );
  }
}
