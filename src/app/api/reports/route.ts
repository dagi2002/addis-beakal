import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitReport } from "@/features/reports/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    await submitReport(await request.json(), actor);

    return NextResponse.json({
      message: "Report submitted. It is now available for moderation review."
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid report." }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not submit the report." }, { status: 400 });
  }
}
