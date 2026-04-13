import React, { useState } from 'react';

interface Alert {
  id: string;
  technician: string;
  reason: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

const CoordinatorMonitor: React.FC = () => {
  const [alerts] = useState<Alert[]>([
    { id: '1', technician: 'Juan Perez', reason: 'Error de foto detectado por IA Cliente', timestamp: '10:45 AM', severity: 'high' },
    { id: '2', technician: 'Maria Garcia', reason: 'Entrada a zona no autorizada', timestamp: '11:12 AM', severity: 'medium' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-10">
      <header className="mb-12 flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/5">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Centro de Comando Regional</h1>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Supervisión Operativa • Nivel de Seguridad Omega</p>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-balance">Cuadrillas Activas</p>
              <p className="text-2xl font-black italic">24</p>
           </div>
           <div className="h-10 w-px bg-white/10"></div>
           <div className="text-right">
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Eventos Críticos</p>
              <p className="text-2xl font-black italic text-red-500">02</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Flujo de Incidentes en Vivo</h2>
              <button className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:underline">Limpiar Historial</button>
           </div>

           <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-white/5 border border-white/5 hover:border-red-500/30 p-8 rounded-[2.5rem] transition-all group relative overflow-hidden">
                   <div className={`absolute top-0 left-0 w-1 h-full ${alert.severity === 'high' ? 'bg-red-600' : 'bg-amber-500'}`}></div>
                   <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-6">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-2xl ${alert.severity === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                            {alert.severity === 'high' ? '🚨' : '⚠️'}
                         </div>
                         <div>
                            <div className="flex items-center space-x-3 mb-1">
                               <span className="text-[10px] font-black uppercase text-slate-300 italic">{alert.technician}</span>
                               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">• {alert.timestamp}</span>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-4">{alert.reason}</h3>
                            <div className="flex space-x-3">
                               <button className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">Interceptar Llamada</button>
                               <button className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20">Desactivar Logic ID</button>
                            </div>
                         </div>
                      </div>
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${alert.severity === 'high' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'}`}>
                         Prioridad {alert.severity === 'high' ? 'ALTA' : 'MEDIA'}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </section>

        <aside className="space-y-8">
           <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 text-white/5 text-9xl transition-transform group-hover:scale-110">📡</div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">Sincronización Satelital</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-10">Análisis GPS en Tiempo Real</p>
              
              <div className="h-48 bg-black/20 rounded-3xl border border-white/5 flex items-center justify-center p-4">
                 <div className="text-center">
                    <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Adquiriendo Posiciones...</p>
                 </div>
              </div>
           </div>

           <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 italic">Eficiencia de Personal</h4>
              <div className="space-y-6">
                 {[
                   { label: 'CUMPLIMIENTO SLA', val: 94, color: 'bg-green-500' },
                   { label: 'RATING SEGURIDAD', val: 88, color: 'bg-blue-500' },
                   { label: 'VALIDACIONES ID', val: 100, color: 'bg-indigo-500' }
                 ].map(stat => (
                   <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest italic">
                         <span>{stat.label}</span>
                         <span>{stat.val}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${stat.color} shadow-[0_0_10px_rgba(255,255,255,0.3)]`} style={{ width: `${stat.val}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </aside>
      </div>

      <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
         <span>Consola de Comando Fibex • Supervisión Multiterritorio • v5.0.0</span>
         <span className="text-blue-500/40">Conexión Segura: Encriptado de 128-bit</span>
      </footer>
    </div>
  );
};

export default CoordinatorMonitor;
