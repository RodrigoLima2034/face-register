import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "facecan_admin";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "SESSION_SECRET não configurado. Configure a variável no .env.local."
    );
  }

  return secret;
}

function sign(email: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(email)
    .digest("hex");
}

export function createAdminToken(email: string): string {
  return `${email}.${sign(email)}`;
}

export function verifyAdminToken(value?: string): boolean {
  if (!value) {
    return false;
  }

  const separator = value.lastIndexOf(".");

  if (separator <= 0) {
    return false;
  }

  const email = value.slice(0, separator);
  const mac = value.slice(separator + 1);

  if (!email || !mac) {
    return false;
  }

  const expected = sign(email);

  if (mac.length !== expected.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(mac, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

export function setAdminCookie(email: string): string {
  return createAdminToken(email);
}

export function requestIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function attachAdminCookie(
  response: NextResponse,
  email: string
): NextResponse {
  const token = createAdminToken(email);

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  return response;
}

export function clearAdminCookie(): void {
  // Mantida para compatibilidade com a rota atual de logout.
}

export function clearAdminCookieFromResponse(
  response: NextResponse
): NextResponse {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export function isAdmin(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}