import { NextResponse } from "next/server";

import { markNotificationRead } from "@/features/notifications/service";
import { getSessionActor } from "@/lib/viewer";
import { AuthorizationError } from "@/server/auth/policies";

type NotificationRouteProps = {
  params: Promise<{ notificationId: string }>;
};

export async function PATCH(_: Request, { params }: NotificationRouteProps) {
  try {
    const actor = await getSessionActor();
    const { notificationId } = await params;
    const notification = await markNotificationRead(notificationId, actor);

    return NextResponse.json({ notification });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update that notification." },
      { status: 400 }
    );
  }
}
