import {NextResponse} from "next/server";
import db from "@/lib/db";
import {registerAutomatic} from "@/lib/attendance";

export const runtime="nodejs";

export async function GET() {
  const records=db.prepare(`
    SELECT r.*, e.name, e.registration
    FROM attendance_records r JOIN employees e ON e.id=r.employee_id
    ORDER BY r.occurred_at DESC LIMIT 500
  `).all();
  return NextResponse.json({records});
}

export async function POST(req:Request) {
  try {
    const body=await req.json();
    const employeeId=Number(body.employeeId);
    if(!Number.isInteger(employeeId)) return NextResponse.json({message:"Funcionário inválido."},{status:400});
    const employee=db.prepare("SELECT id,name FROM employees WHERE id=? AND status='ATIVO'").get(employeeId) as any;
    if(!employee) return NextResponse.json({message:"Funcionário não encontrado ou inativo."},{status:404});
    const result=registerAutomatic(employeeId,String(body.source||"TERMINAL").slice(0,40),String(body.deviceId||"").slice(0,80),typeof body.confidence==="number"?body.confidence:undefined);
    if(!result.ok) return NextResponse.json(result,{status:409});
    return NextResponse.json({employee,result});
  } catch {
    return NextResponse.json({message:"Erro ao registrar ponto."},{status:500});
  }
}
