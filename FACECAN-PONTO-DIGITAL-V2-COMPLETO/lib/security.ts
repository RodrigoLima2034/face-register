import crypto from "node:crypto";

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
  const signature = sign(email);

  return `${email}.${signature}`;
}

export function verifyAdminToken(value?: string): boolean {
  if (!value) {
    return false;
  }

  const [email, mac] = value.split(".");

  if (!email || !mac) {
    return false;
  }

  const expected = sign(email);

  if (mac.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(mac),
    Buffer.from(expected)
  );
}

export function isAdmin(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}