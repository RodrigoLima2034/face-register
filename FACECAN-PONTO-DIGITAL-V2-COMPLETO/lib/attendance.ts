import db from "./db";

type Shift = {
  id:number; name:string; entry_start:string; entry_end:string;
  break_start:string|null; break_end:string|null;
  exit_start:string; exit_end:string; crosses_midnight:number;
};

function minutes(hhmm: string) {
  const [h,m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function localHHMM(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour:"2-digit", minute:"2-digit", hour12:false,
    timeZone: process.env.TZ || "America/Sao_Paulo"
  }).formatToParts(date);
  return `${parts.find(p=>p.type==="hour")?.value}:${parts.find(p=>p.type==="minute")?.value}`;
}

function localDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: process.env.TZ || "America/Sao_Paulo",
    year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit",
    hour12:false
  }).format(date).replace(" ", "T");
}

function inWindow(now:number, start:string, end:string) {
  const s=minutes(start), e=minutes(end);
  return s <= e ? now >= s && now <= e : now >= s || now <= e;
}

export function nextEvent(employeeId:number, nowDate=new Date()) {
  const employee = db.prepare(`
    SELECT e.*, s.* FROM employees e JOIN shifts s ON s.id=e.shift_id WHERE e.id=?
  `).get(employeeId) as any;
  if (!employee) throw new Error("Funcionário não encontrado");

  const now = minutes(localHHMM(nowDate));
  const shift = employee as Shift;

  // Most recent records are used to avoid duplicate/incorrect events.
  const last = db.prepare(`
    SELECT * FROM attendance_records WHERE employee_id=? ORDER BY occurred_at DESC LIMIT 1
  `).get(employeeId) as any;

  const day = localDateTime(nowDate).slice(0,10);
  const today = db.prepare(`
    SELECT event_type FROM attendance_records
    WHERE employee_id=? AND substr(occurred_at,1,10)=?
    ORDER BY occurred_at
  `).all(employeeId, day) as {event_type:string}[];
  const events = new Set(today.map(x=>x.event_type));

  if (inWindow(now, shift.entry_start, shift.entry_end) && !events.has("ENTRADA")) return "ENTRADA";
  if (shift.break_start && shift.break_end && inWindow(now, shift.break_start, shift.break_end)) {
    if (events.has("ENTRADA") && !events.has("SAIDA_INTERVALO")) return "SAIDA_INTERVALO";
    if (events.has("SAIDA_INTERVALO") && !events.has("RETORNO_INTERVALO")) return "RETORNO_INTERVALO";
  }
  if (inWindow(now, shift.exit_start, shift.exit_end)) {
    // Night shift may have its exit on the following calendar day.
    if (shift.crosses_midnight && !events.has("ENTRADA")) return null;
    if (!events.has("SAIDA")) return "SAIDA";
    // If last event is from previous day, still allow exit.
    if (shift.crosses_midnight && last?.event_type === "ENTRADA") return "SAIDA";
  }
  return null;
}

export function registerAutomatic(employeeId:number, source="TERMINAL", deviceId="", confidence?:number) {
  const event = nextEvent(employeeId);
  if (!event) return {ok:false, message:"Fora da janela de registro ou sequência já concluída."};
  const occurredAt = localDateTime(new Date());
  const insert = db.prepare(`
    INSERT INTO attendance_records(employee_id,event_type,occurred_at,source,device_id,confidence)
    VALUES(?,?,?,?,?,?)
  `);
  const result = insert.run(employeeId,event,occurredAt,source,deviceId,confidence ?? null);
  return {ok:true, id:result.lastInsertRowid, event, occurredAt};
}
