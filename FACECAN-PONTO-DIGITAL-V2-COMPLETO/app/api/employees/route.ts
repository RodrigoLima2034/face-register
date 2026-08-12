import {NextResponse} from "next/server";
import db from "@/lib/db";
import {isAdmin, requestIp} from "@/lib/security";

export const runtime="nodejs";

export async function GET() {
  const employees=db.prepare(`
    SELECT e.*, s.name as shift_name FROM employees e JOIN shifts s ON s.id=e.shift_id ORDER BY e.name
  `).all();
  return NextResponse.json({employees});
}

export async function POST(req:Request) {
  if(!isAdmin()) return NextResponse.json({message:"Não autorizado"},{status:401});
  try {
    const body=await req.json();
    if(!body.name || !body.registration || !body.shiftId) return NextResponse.json({message:"Nome, matrícula e turno são obrigatórios."},{status:400});
    const result=db.prepare("INSERT INTO employees(registration,name,department,shift_id) VALUES(?,?,?,?)").run(
      String(body.registration).trim().slice(0,50),
      String(body.name).trim().slice(0,120),
      String(body.department||"").trim().slice(0,120),
      Number(body.shiftId)
    );
    db.prepare("INSERT INTO audit_logs(actor,action,resource,resource_id,ip,details) VALUES(?,?,?,?,?,?)")
      .run("ADMIN","CREATE","employee",String(result.lastInsertRowid),requestIp(),"Cadastro de funcionário");
    return NextResponse.json({message:"Funcionário cadastrado.",id:result.lastInsertRowid},{status:201});
  } catch(e:any) {
    return NextResponse.json({message:e?.code==="SQLITE_CONSTRAINT_UNIQUE"?"Matrícula já cadastrada.":"Não foi possível cadastrar."},{status:400});
  }
}
