import { describe, expect, it } from "vitest";
import { checkPassword, signSessionToken, verifySessionToken } from "./auth";

const SECRET = "test-secret-do-not-use-in-prod";

describe("signSessionToken / verifySessionToken", () => {
  it("round-trips a freshly signed token as valid", async () => {
    const token = await signSessionToken(SECRET, Date.now() + 60_000);
    await expect(verifySessionToken(SECRET, token)).resolves.toBe(true);
  });

  it("rejects an expired token", async () => {
    const token = await signSessionToken(SECRET, Date.now() - 1);
    await expect(verifySessionToken(SECRET, token)).resolves.toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(SECRET, Date.now() + 60_000);
    await expect(verifySessionToken("wrong-secret", token)).resolves.toBe(false);
  });

  it("rejects a token whose payload was tampered with (expiry extended)", async () => {
    const token = await signSessionToken(SECRET, Date.now() - 1);
    const [payloadB64, sigB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    const tamperedPayload = JSON.stringify({ exp: Date.now() + 60_000 * 60 });
    const tamperedB64 = Buffer.from(tamperedPayload)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const tamperedToken = `${tamperedB64}.${sigB64}`;

    expect(payload.exp).toBeLessThan(Date.now());
    await expect(verifySessionToken(SECRET, tamperedToken)).resolves.toBe(false);
  });

  it("rejects a token with a corrupted signature", async () => {
    const token = await signSessionToken(SECRET, Date.now() + 60_000);
    const [payloadB64, sigB64] = token.split(".");
    const corrupted = sigB64.slice(0, -1) + (sigB64.at(-1) === "a" ? "b" : "a");
    await expect(verifySessionToken(SECRET, `${payloadB64}.${corrupted}`)).resolves.toBe(false);
  });

  it("rejects malformed tokens without throwing", async () => {
    await expect(verifySessionToken(SECRET, "not-a-token")).resolves.toBe(false);
    await expect(verifySessionToken(SECRET, "")).resolves.toBe(false);
    await expect(verifySessionToken(SECRET, "a.b.c")).resolves.toBe(false);
    await expect(verifySessionToken(SECRET, null)).resolves.toBe(false);
    await expect(verifySessionToken(SECRET, undefined)).resolves.toBe(false);
  });
});

describe("checkPassword", () => {
  it("accepts a matching password", async () => {
    await expect(checkPassword("hunter2", "hunter2")).resolves.toBe(true);
  });

  it("rejects a non-matching password", async () => {
    await expect(checkPassword("wrong", "hunter2")).resolves.toBe(false);
  });

  it("rejects a password differing only in length", async () => {
    await expect(checkPassword("hunter2extra", "hunter2")).resolves.toBe(false);
  });

  it("treats an empty candidate as non-matching against a real password", async () => {
    await expect(checkPassword("", "hunter2")).resolves.toBe(false);
  });
});
