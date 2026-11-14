import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "@/lib/auth/errors";

describe("authentication error handling", () => {
  it("explains provider collisions", () => {
    expect(
      getAuthErrorMessage({
        code: "auth/account-exists-with-different-credential",
        message: "collision",
      }),
    ).toContain("already registered with another provider");
  });

  it("explains duplicate credentials", () => {
    expect(
      getAuthErrorMessage({
        code: "auth/credential-already-in-use",
        message: "duplicate",
      }),
    ).toContain("already linked");
  });

  it("returns a safe fallback for unknown errors", () => {
    expect(getAuthErrorMessage({ code: "auth/unknown", message: "" })).toContain(
      "Authentication failed",
    );
  });
});
