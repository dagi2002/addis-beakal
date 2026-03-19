import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitReport, submitReportSchema } from "@/features/reports/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";
import { readDatabase } from "@/server/database";

type RouteContext = {
  params: Promise<{ replyId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { replyId } = await context.params;
    const database = await readDatabase();
    const reply = database.ownerReviewReplies.find((entry) => entry.id === replyId);

    if (!reply) {
      return NextResponse.json({ error: "Owner reply not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = submitReportSchema.parse({
      ...body,
      businessId: reply.businessId,
      targetType: "owner_reply",
      targetId: replyId
    });
    const report = await submitReport(parsed, actor);

    return NextResponse.json({ report, message: "Report submitted for moderation review." });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid report." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit report." },
      { status: 400 }
    );
  }
}
