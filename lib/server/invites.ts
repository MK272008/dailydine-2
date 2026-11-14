import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const INVITE_TTL_MS = 15 * 60 * 1000;

function getSigningSecret() {
  const secret = process.env.INVITE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("INVITE_SIGNING_SECRET is required");
  }

  return secret;
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("base64url");
}

export function createInviteToken(inviteId: string, restaurantId: string) {
  const expiresAt = Date.now() + INVITE_TTL_MS;
  const payload = encode({ inviteId, restaurantId, expiresAt });
  return {
    token: `${payload}.${sign(payload)}`,
    expiresAt,
  };
}

export function verifyInviteToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Invalid invitation token");
  }

  const expected = sign(payload);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid invitation signature");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    inviteId?: unknown;
    restaurantId?: unknown;
    expiresAt?: unknown;
  };

  if (
    typeof parsed.inviteId !== "string" ||
    typeof parsed.restaurantId !== "string" ||
    typeof parsed.expiresAt !== "number" ||
    parsed.expiresAt <= Date.now()
  ) {
    throw new Error("Invitation has expired");
  }

  return parsed as {
    inviteId: string;
    restaurantId: string;
    expiresAt: number;
  };
}

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
