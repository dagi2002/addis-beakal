import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { updateAdminUserRole } from "@/features/admin/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const actor = await getSessionActor();
    const { userId } = await context.params;
    const user = await updateAdminUserRole(userId, await request.json(), actor);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid role change." }, { status: 400 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update user role." },
      { status: 400 }
    );
  }
}
