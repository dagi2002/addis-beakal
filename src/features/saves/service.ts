import { toggleBusinessSave } from "@/features/businesses/logic";
import type { AppActor } from "@/server/auth/actor";
import { assertCanToggleSave } from "@/server/auth/policies";
import { updateDatabase } from "@/server/database";

export async function toggleSaveForActor(businessId: string, actor: AppActor) {
  assertCanToggleSave(actor);

  let response: { saved: boolean; saveCount: number } = { saved: false, saveCount: 0 };

  await updateDatabase((database) => {
    const result = toggleBusinessSave(database, businessId, actor.userId!);
    response = {
      saved: result.saved,
      saveCount: result.saveCount
    };
    return result.database;
  });

  return response;
}
