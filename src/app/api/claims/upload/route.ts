import { NextResponse } from "next/server";

import { getSessionActor } from "@/lib/viewer";
import { assertAuthenticated, AuthorizationError } from "@/server/auth/policies";
import { storeClaimUploads } from "@/server/storage/claim-uploads";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    assertAuthenticated(actor);
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const proofFileUrls = await storeClaimUploads(files);
    return NextResponse.json({ proofFileUrls });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload proof file." },
      { status: 400 }
    );
  }
}
