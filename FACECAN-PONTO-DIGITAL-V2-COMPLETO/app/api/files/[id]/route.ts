import {NextResponse} from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import db from "@/lib/db";
import {isAdmin} from "@/lib/security";

export const runtime="nodejs";

export async function GET(_req:Request,{params}:{params:{id:string}}){
  if(!isAdmin()) return NextResponse.json({message:"Não autorizado"},{status:401});
  const row=db.prepare("SELECT * FROM files WHERE id=?").get(Number(params.id)) as any;
  if(!row) return NextResponse.json({message:"Arquivo não encontrado."},{status:404});
  const target=path.join(process.cwd(),"data","uploads",row.stored_name);
  try{
    const data=await fs.readFile(target);
    return new Response(data,{headers:{
      "Content-Type":row.mime_type||"application/octet-stream",
      "Content-Disposition":`attachment; filename="${row.original_name.replaceAll('"','')}"`,
      "X-Content-Type-Options":"nosniff"
    }});
  }catch{return NextResponse.json({message:"Arquivo indisponível."},{status:404});}
}
