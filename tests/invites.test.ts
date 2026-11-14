import { beforeEach, describe, expect, it } from "vitest";
import {
  createInviteToken,
  hashInviteToken,
  verifyInviteToken,
} from "@/lib/server/invites";

beforeEach(() => {
  process.env.INVITE_SIGNING_SECRET = "test-invite-secret";
});

describe("employee invitation tokens", () => {
  it("round-trips signed invitation data", () => {
    const { token } = createInviteToken("invite-1", "restaurant-1");
    expect(verifyInviteToken(token)).toMatchObject({
      inviteId: "invite-1",
      restaurantId: "restaurant-1",
    });
    expect(hashInviteToken(token)).toHaveLength(64);
  });

  it("rejects tampered tokens", () => {
    const { token } = createInviteToken("invite-1", "restaurant-1");
    expect(() => verifyInviteToken(`${token}tampered`)).toThrow(
      "Invalid invitation signature",
    );
  });
});
