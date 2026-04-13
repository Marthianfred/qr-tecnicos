import React, { useState } from 'react';

const TechnicianDashboard: React.FC = () => {
  const [status, setStatus] = useState<'DISPONIBLE' | 'EN RUTA' | 'EN SITIO'>('DISPONIBLE');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-8">
      <header className="flex justify-between items-center mb-12 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20">🏎️</div>
           <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic mb-1">Unidad de Campo Fibex</p>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic m-0">Hola, Juan Perez</h1>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Estatus Actual</p>
           <span className="bg-green-500 text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest animate-pulse shadow-lg shadow-green-500/20">{status}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 group hover:bg-white/10 transition-colors">
           <div className="flex justify-between items-start mb-10">
              <span className="text-4xl">📦</span>
              <span className="bg-white/10 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest italic tracking-tight">Carga de Hoy</span>
           </div>
           <h3 className="text-4xl font-black italic mb-2 tracking-tighter">12</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Órdenes de Servicio Pendientes</p>
        </div>

        <div className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
           <div className="absolute right-0 bottom-0 text-white/5 text-9xl transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform">📍</div>
           <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8">Siguiente Destino</h3>
           <p className="text-2xl font-black italic mb-2 tracking-tight">Av. Principal de Las Mercedes, Edif GDA</p>
           <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Referencia: Frente al Centro Comercial</p>
           <button className="mt-10 bg-white text-blue-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Iniciar Navegación</button>
        </div>
      </div>

      <section className="bg-white/5 rounded-[3rem] border border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
           <h2 className="text-lg font-black uppercase tracking-widest italic">Acciones Rápidas</h2>
           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Protocolo de Campo Activo</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
           <button className="p-12 text-center hover:bg-white/5 transition-colors group">
              <div className="text-3xl mb-4 group-hover:scale-125 transition-transform">📸</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Escaneo de Identidad</p>
           </button>
           <button className="p-12 text-center hover:bg-white/5 transition-colors group">
              <div className="text-3xl mb-4 group-hover:scale-125 transition-transform">📋</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reportar Incidente</p>
           </button>
           <button className="p-12 text-center hover:bg-white/5 transition-colors group">
              <div className="text-3xl mb-4 group-hover:scale-125 transition-transform">🛠️</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bitácora Técnica</p>
           </button>
           <button className="p-12 text-center hover:bg-white/5 transition-colors group">
              <div className="text-3xl mb-4 group-hover:scale-125 transition-transform">🆘</div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pánico / Emergencia</p>
           </button>
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Fibex Strategic Logistics • v5.0.0 Master Console</p>
        <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Conexión Segura vía TrustLayer Logic</span>
      </footer>
    </div>
  );
};

export default TechnicianDashboard;
