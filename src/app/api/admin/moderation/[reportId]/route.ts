import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateModerationReport } from "@/features/admin/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { reportId } = await context.params;
    const report = await updateModerationReport(reportId, await request.json(), actor);

    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid moderation action." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update moderation report." },
      { status: 400 }
    );
  }
}
