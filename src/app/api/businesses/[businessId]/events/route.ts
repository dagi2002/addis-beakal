import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordBusinessEngagement } from "@/features/engagement/service";
import { getSessionActor } from "@/lib/viewer";

type RouteContext = {
  params: Promise<{ businessId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { businessId } = await context.params;
    const actor = await getSessionActor();
    const event = await recordBusinessEngagement(businessId, await request.json(), actor);

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid event." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not record engagement." },
      { status: 400 }
    );
  }
}
