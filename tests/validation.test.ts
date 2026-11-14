import { describe, expect, it } from "vitest";
import {
  assertMoney,
  assertOrderType,
  assertPositiveQuantity,
  assertRestaurantInput,
  ValidationError,
} from "@/lib/domain/validation";

describe("domain validation", () => {
  it("accepts a valid restaurant", () => {
    expect(() =>
      assertRestaurantInput({
        name: "VentureX",
        address: "Main Street",
        tableCount: 12,
        taxPercent: 5,
      }),
    ).not.toThrow();
  });

  it("rejects invalid restaurant tax", () => {
    expect(() =>
      assertRestaurantInput({
        name: "VentureX",
        address: "Main Street",
        tableCount: 12,
        taxPercent: 101,
      }),
    ).toThrow(ValidationError);
  });

  it("validates order types, quantities, and money", () => {
    expect(() => assertOrderType("TAKEAWAY")).not.toThrow();
    expect(() => assertPositiveQuantity(2)).not.toThrow();
    expect(() => assertMoney(10.5)).not.toThrow();
    expect(() => assertPositiveQuantity(0)).toThrow(ValidationError);
    expect(() => assertMoney(10.123)).toThrow(ValidationError);
  });
});
