"use client";

import { useEffect, useRef, useState } from "react";

type Employee = {id:number; registration:string; name:string; department:string; shift_name:string; face_status:string};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [employees,setEmployees]=useState<Employee[]>([]);
  const [selected,setSelected]=useState("");
  const [camera,setCamera]=useState(false);
  const [clock,setClock]=useState(new Date());
  const [message,setMessage]=useState("Aguardando reconhecimento facial");
  const [busy,setBusy]=useState(false);

  useEffect(()=> {
    fetch("/api/employees").then(r=>r.json()).then(d=>setEmployees(d.employees||[]));
    const t=setInterval(()=>setClock(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  async function startCamera() {
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false});
      if(videoRef.current){videoRef.current.srcObject=stream; await videoRef.current.play();}
      setCamera(true); setMessage("Câmera ativa • posicione o rosto dentro da moldura");
    } catch { setMessage("Não foi possível acessar a câmera. Autorize o acesso no navegador."); }
  }

  async function registerPoint() {
    if(!selected) { setMessage("Selecione um funcionário para o modo de demonstração."); return; }
    setBusy(true);
    const res=await fetch("/api/attendance",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({employeeId:Number(selected),source:"TERMINAL-DEMO",deviceId:"TERMINAL-01",confidence:0.99})});
    const data=await res.json();
    setBusy(false);
    if(res.ok) setMessage(`✓ ${data.employee.name} • ${data.result.event.replaceAll("_"," ")} • ${data.result.occurredAt.slice(11,16)}`);
    else setMessage(data.message||"Não foi possível registrar.");
  }

  const date=clock.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  const time=clock.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return <main className="terminal">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">F</div><div><strong>FACECAN</strong><span>PONTO DIGITAL • V2</span></div></div>
      <div className="top-actions"><a className="ghost-btn" href="/admin">Área administrativa</a></div>
    </header>
    <section className="terminal-grid">
      <div className="camera-card">
        <div className="card-head"><div><span className="eyebrow">TERMINAL DE PONTO</span><h1>Registro facial</h1></div><span className={camera?"status live":"status"}><i/> {camera?"CÂMERA ATIVA":"AGUARDANDO"}</span></div>
        <div className="camera-frame">
          <video ref={videoRef} muted playsInline />
          <div className="face-guide"><span/><span/><span/><span/></div>
          {!camera && <div className="camera-placeholder"><div className="camera-icon">◉</div><p>Ative a câmera para iniciar</p><button className="primary-btn" onClick={startCamera}>Ativar câmera</button></div>}
        </div>
        <div className="terminal-message"><div className="pulse"/><span>{message}</span></div>
        <div className="demo-row">
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">Funcionário para demonstração</option>
            {employees.map(e=><option key={e.id} value={e.id}>{e.registration} • {e.name} • {e.shift_name}</option>)}
          </select>
          <button className="primary-btn" disabled={busy} onClick={registerPoint}>{busy?"Registrando...":"Registrar ponto"}</button>
        </div>
      </div>
      <aside className="info-panel">
        <div className="clock">{time}</div>
        <div className="date">{date}</div>
        <div className="rule-card"><span>REGRA AUTOMÁTICA</span><h3>O sistema decide o evento</h3><p>Entrada, intervalo, retorno e saída são determinados pelo turno do funcionário e pela janela de horário configurada.</p></div>
        <div className="shift-mini"><div><b>☀ Manhã</b><span>06:00–11:00 entrada</span><span>12:00–13:30 intervalo</span><span>17:00–18:00 saída</span></div><div><b>☾ Noite</b><span>18:00–22:00 entrada</span><span>01:20–07:00 saída</span></div></div>
        <div className="security-note">🔒 Terminal protegido • registros auditáveis</div>
      </aside>
    </section>
  </main>;
}
