import { NextResponse } from "next/server";

const crypto = require("crypto");
const COOKIE_NAME = "clarifynet_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const COOKIE_SECRET =
  process.env.COOKIE_SIGNING_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "clarifynet_dev_secret";

interface SessionPayload {
  id: string;
  exp: number;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(
    padded.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
}

function getSignature(value: string) {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(value).digest("hex");
}

function createSessionToken(payload: SessionPayload) {
  const serialized = JSON.stringify(payload);
  const encoded = base64UrlEncode(serialized);
  const signature = getSignature(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;
  const expected = getSignature(encoded);
  const validSignature =
    Buffer.from(signature, "utf8").length ===
      Buffer.from(expected, "utf8").length &&
    crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  if (!validSignature) return null;

  try {
    const json = base64UrlDecode(encoded);
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.exp !== "number" || Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionTokenFromRequest(req: Request) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return match.substring(COOKIE_NAME.length + 1);
}

export function attachSessionCookie(response: NextResponse, userId: string) {
  const token = createSessionToken({
    id: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
