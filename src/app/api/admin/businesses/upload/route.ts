import { NextResponse } from "next/server";

import { getSessionActor } from "@/lib/viewer";
import { assertIsAdmin, AuthorizationError } from "@/server/auth/policies";
import { storeBusinessUploads } from "@/server/storage/business-uploads";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    assertIsAdmin(actor);
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const photoUrls = await storeBusinessUploads(files);
    return NextResponse.json({ photoUrls });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload business images." },
      { status: 400 }
    );
  }
}
