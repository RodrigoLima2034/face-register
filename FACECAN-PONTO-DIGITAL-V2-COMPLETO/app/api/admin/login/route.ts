import {NextResponse} from "next/server";
import {setAdminCookie, requestIp} from "@/lib/security";
import db from "@/lib/db";

export const runtime="nodejs";

export async function POST(req:Request) {
  const body=await req.json();
  const email=String(body.email||"").trim();
  const password=String(body.password||"");
  const expectedEmail=process.env.ADMIN_EMAIL||"admin@empresa.local";
  const expectedPassword=process.env.ADMIN_PASSWORD||"change-this-before-production";
  if(email!==expectedEmail || password!==expectedPassword) {
    return NextResponse.json({message:"Credenciais inválidas."},{status:401});
  }
  setAdminCookie(email);
  db.prepare("INSERT INTO audit_logs(actor,action,resource,ip,details) VALUES(?,?,?,?,?)")
    .run(email,"LOGIN","admin",requestIp(),"Login administrativo");
  return NextResponse.json({ok:true});
}
