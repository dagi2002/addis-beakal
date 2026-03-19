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
      database.saves,
      database.engagementEvents
    );

    expect(recalculated.reviewCount).toBe(2);
    expect(recalculated.rating).toBe(4.5);
  });

  it("counts persisted page views as the business view total", () => {
    const database = buildSeedDatabase();
    const business = database.businesses.find((item) => item.id === "biz-yod");

    expect(business).toBeDefined();

    database.engagementEvents.push(
      {
        id: "event-1",
        businessId: "biz-yod",
        sessionKey: "session-a",
        type: "page_view",
        createdAt: "2026-03-18T10:00:00.000Z"
      },
      {
        id: "event-2",
        businessId: "biz-yod",
        sessionKey: "session-b",
        type: "page_view",
        createdAt: "2026-03-18T11:00:00.000Z"
      },
      {
        id: "event-3",
        businessId: "biz-yod",
        sessionKey: "session-b",
        type: "directions_click",
        createdAt: "2026-03-18T11:10:00.000Z"
      }
    );

    const recalculated = recalculateBusinessMetrics(
      business!,
      database.reviews,
      database.saves,
      database.engagementEvents
    );

    expect(recalculated.viewCount).toBe(2);
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
