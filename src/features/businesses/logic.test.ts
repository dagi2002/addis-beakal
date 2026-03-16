import { describe, expect, it } from "vitest";

import { recalculateBusinessMetrics, toggleBusinessSave } from "@/features/businesses/logic";
import { buildSeedDatabase } from "@/features/businesses/seed";

describe("business aggregation logic", () => {
  it("excludes pending and removed reviews from rating recalculation", () => {
    const database = buildSeedDatabase();
    const business = database.businesses.find((item) => item.id === "biz-tomoca-atlas");

    expect(business).toBeDefined();

    const recalculated = recalculateBusinessMetrics(
      business!,
      database.reviews,
      database.saves
    );

    expect(recalculated.reviewCount).toBe(2);
    expect(recalculated.rating).toBe(4.5);
  });

  it("increments and decrements saves correctly for the same viewer", () => {
    const database = buildSeedDatabase();
    const targetBusinessId = "biz-fendika";

    const firstToggle = toggleBusinessSave(database, targetBusinessId, "viewer_test");
    expect(firstToggle.saved).toBe(true);
    expect(firstToggle.saveCount).toBe(2);

    const secondToggle = toggleBusinessSave(database, targetBusinessId, "viewer_test");
    expect(secondToggle.saved).toBe(false);
    expect(secondToggle.saveCount).toBe(1);
  });
});
