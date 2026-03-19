import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateOwnedBusiness } from "@/features/owner/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ businessId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { businessId } = await context.params;
    const business = await updateOwnedBusiness(businessId, await request.json(), actor);

    return NextResponse.json({ business });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid listing update." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update listing." },
      { status: 400 }
    );
  }
}
