import { NextResponse } from "next/server";
import {
  attachAdminCookie,
  requestIp,
} from "@/lib/security";
import db from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();

  const email = String(body.email || "").trim();
  const password = String(body.password || "");

  const expectedEmail =
    process.env.ADMIN_EMAIL || "admin@empresa.local";

  const expectedPassword =
    process.env.ADMIN_PASSWORD || "change-this-before-production";

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json(
      { message: "Credenciais inválidas." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });

  attachAdminCookie(response, email);

  db.prepare(
    "INSERT INTO audit_logs(actor,action,resource,ip,details) VALUES(?,?,?,?,?)"
  ).run(
    email,
    "LOGIN",
    "admin",
    requestIp(req),
    "Login administrativo"
  );

  return response;
}