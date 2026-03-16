import { NextResponse } from "next/server";
import { z } from "zod";

import { toggleSaveForViewer } from "@/features/businesses/service";
import { ensureViewerId } from "@/lib/viewer";

const saveSchema = z.object({
  businessId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const viewerId = await ensureViewerId();
    const body = saveSchema.parse(await request.json());
    const result = await toggleSaveForViewer(body.businessId, viewerId);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not update save state." }, { status: 400 });
  }
}
