/**
 * Adaptadores de integração.
 * Nunca coloque chaves AWS/Oracle/News Systems no frontend.
 * A implementação final deve seguir o contrato fornecido pela News Systems.
 */
export type ExportRecord = {
  registration:string; name:string; event_type:string; occurred_at:string;
};

export function toOracleText(records:ExportRecord[]) {
  return records.map(r =>
    [r.registration,r.occurred_at.replaceAll("-","").replaceAll(":","").replace("T",""),r.event_type].join(";")
  ).join("\n") + "\n";
}

export async function sendToNewsSystems(payload:unknown) {
  const base=process.env.NEWS_SYSTEMS_BASE_URL;
  const key=process.env.NEWS_SYSTEMS_API_KEY;
  if(!base || !key) throw new Error("Integração News Systems não configurada.");
  const response=await fetch(base,{method:"POST",headers:{
    "content-type":"application/json",
    "authorization":`Bearer ${key}`
  },body:JSON.stringify(payload),cache:"no-store"});
  if(!response.ok) throw new Error(`News Systems respondeu HTTP ${response.status}`);
  return response.json().catch(()=>({ok:true}));
}
