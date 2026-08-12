import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import db from "@/lib/db";
import {isAdmin,requestIp} from "@/lib/security";

export const runtime="nodejs";

const allowed=new Set([".pdf",".csv",".txt",".xml",".json",".xlsx",".zip"]);
const max=15*1024*1024;

export async function GET(){
  if(!isAdmin()) return NextResponse.json({message:"Não autorizado"},{status:401});
  return NextResponse.json({files:db.prepare("SELECT id,original_name,mime_type,size_bytes,status,created_at FROM files ORDER BY created_at DESC").all()});
}

export async function POST(req:Request){
  if(!isAdmin()) return NextResponse.json({message:"Não autorizado"},{status:401});
  const form=await req.formData();
  const value=form.get("file");
  if(!(value instanceof File)) return NextResponse.json({message:"Arquivo não enviado."},{status:400});
  if(value.size>max) return NextResponse.json({message:"Arquivo acima de 15 MB."},{status:413});
  const ext=path.extname(value.name).toLowerCase();
  if(!allowed.has(ext)) return NextResponse.json({message:"Tipo de arquivo não permitido."},{status:415});
  const stored=`${crypto.randomUUID()}${ext}`;
  const target=path.join(process.cwd(),"data","uploads",stored);
  await fs.writeFile(target,Buffer.from(await value.arrayBuffer()),{flag:"wx"});
  db.prepare("INSERT INTO files(original_name,stored_name,mime_type,size_bytes,uploaded_by) VALUES(?,?,?,?,?)")
    .run(value.name,stored,value.type||"application/octet-stream",value.size,"ADMIN");
  db.prepare("INSERT INTO audit_logs(actor,action,resource,ip,details) VALUES(?,?,?,?,?)")
    .run("ADMIN","UPLOAD","file",requestIp(),`Arquivo ${value.name}`);
  return NextResponse.json({message:"Arquivo recebido e armazenado com segurança."},{status:201});
}
