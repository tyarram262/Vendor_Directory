/**
 * Admin session auth: a single hardcoded password (ADMIN_PASSWORD) behind a
 * signed, expiring cookie. No user table, no auth library.
 *
 * Built exclusively on Web Crypto (globalThis.crypto.subtle, atob/btoa,
 * TextEncoder/TextDecoder) rather than Node's `crypto` module, because this
 * module is imported by src/middleware.ts, which runs on the Edge runtime —
 * `crypto.timingSafeEqual` and friends from `node:crypto` aren't available
 * there. Web Crypto works identically in both the Node.js runtime (the login
 * server action) and the Edge runtime (middleware).
 */

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const withPadding = padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=");
  const binary = atob(withPadding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Signs a session token: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature). */
export async function signSessionToken(secret: string, expiresAt: number): Promise<string> {
  const payloadB64 = base64url(new TextEncoder().encode(JSON.stringify({ exp: expiresAt })));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${base64url(new Uint8Array(signature))}`;
}

/**
 * Verifies a session token's signature and expiry. Returns false — never
 * throws — for any tampering, malformed input, wrong secret, or expiry, so
 * callers (middleware, in particular) can treat "false" as the only signal
 * they need.
 */
export async function verifySessionToken(
  secret: string,
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  try {
    const key = await hmacKey(secret);
    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64)),
    );
    const providedSignature = base64urlToBytes(sigB64);
    if (!timingSafeEqual(expectedSignature, providedSignature)) return false;

    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64))) as {
      exp?: number;
    };
    return typeof payload.exp === "number" && Date.now() <= payload.exp;
  } catch {
    return false;
  }
}

/**
 * Constant-time password comparison via SHA-256 digest, so timing doesn't
 * leak how many leading characters matched. Node's `crypto.timingSafeEqual`
 * would do this more directly but isn't Edge-safe; see module docstring.
 */
export async function checkPassword(candidate: string, expected: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(candidate)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
  ]);
  return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}
