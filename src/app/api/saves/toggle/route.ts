import { NextResponse } from "next/server";
import { z } from "zod";

import { toggleSaveForActor } from "@/features/saves/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

const saveSchema = z.object({
  businessId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    const body = saveSchema.parse(await request.json());
    const result = await toggleSaveForActor(body.businessId, actor);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not update save state." }, { status: 400 });
  }
}
