import { NextResponse } from "next/server";

import { getSessionActor } from "@/lib/viewer";
import { assertCanCreateReview, AuthorizationError } from "@/server/auth/policies";
import { storeReviewUploads } from "@/server/storage/review-uploads";

export async function POST(request: Request) {
  try {
    const actor = await getSessionActor();
    assertCanCreateReview(actor);
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const photoUrls = await storeReviewUploads(files);
    return NextResponse.json({ photoUrls });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not upload images." },
      { status: 400 }
    );
  }
}
