import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitReport, submitReportSchema } from "@/features/reports/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";
import { readDatabase } from "@/server/database";

type RouteContext = {
  params: Promise<{ threadId: string; messageId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { threadId, messageId } = await context.params;
    const database = await readDatabase();
    const thread = database.reviewDirectThreads.find((entry) => entry.id === threadId);

    if (!thread || !thread.messages.some((message) => message.id === messageId)) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = submitReportSchema.parse({
      ...body,
      businessId: thread.businessId,
      targetType: "direct_message",
      targetId: messageId
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
