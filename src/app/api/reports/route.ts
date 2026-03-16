import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitReport } from "@/features/reports/service";
import { ensureViewerId } from "@/lib/viewer";

export async function POST(request: Request) {
  try {
    const viewerId = await ensureViewerId();
    await submitReport(await request.json(), viewerId);

    return NextResponse.json({
      message: "Report submitted. It is now available for moderation review."
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid report." }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not submit the report." }, { status: 400 });
  }
}
