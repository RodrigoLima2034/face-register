import {NextResponse} from "next/server";
import db from "@/lib/db";
import PDFDocument from "pdfkit";

export const runtime="nodejs";

export async function GET(req:Request){
  const url=new URL(req.url);
  const format=url.searchParams.get("format")||"csv";
  const records=db.prepare(`
    SELECT e.registration,e.name,r.event_type,r.occurred_at,r.source
    FROM attendance_records r JOIN employees e ON e.id=r.employee_id
    ORDER BY r.occurred_at DESC
  `).all() as any[];

  if(format==="csv"){
    const header="MATRICULA;FUNCIONARIO;EVENTO;DATA_HORA;ORIGEM\n";
    const rows=records.map(r=>[r.registration,r.name,r.event_type,r.occurred_at,r.source].map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
    return new Response(header+rows,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=facecan-registros.csv"}});
  }

  if(format==="pdf"){
    const chunks:Buffer[]=[];
    const doc=new PDFDocument({size:"A4",margin:42});
    doc.on("data",(c)=>chunks.push(c));
    const done=new Promise<void>(resolve=>doc.on("end",()=>resolve()));
    doc.fontSize(20).text("FACECAN — Relatório de Ponto");
    doc.moveDown().fontSize(9).text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
    doc.moveDown();
    records.slice(0,150).forEach(r=>{
      doc.fontSize(9).text(`${r.registration} | ${r.name} | ${r.event_type.replaceAll("_"," ")} | ${r.occurred_at}`);
    });
    doc.end();
    await done;
    return new Response(Buffer.concat(chunks),{headers:{"Content-Type":"application/pdf","Content-Disposition":"attachment; filename=facecan-relatorio.pdf"}});
  }
  return NextResponse.json({message:"Formato inválido."},{status:400});
}
