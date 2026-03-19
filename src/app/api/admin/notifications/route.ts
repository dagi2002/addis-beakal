import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { sendAdminBroadcast } from "@/features/notifications/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const result = await sendAdminBroadcast(await request.json(), actor);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send the message." },
      { status: 400 }
    );
  }
}
