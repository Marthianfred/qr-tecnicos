import React from 'react';

const InconsistencyReport: React.FC = () => {
    return (
        <div className="min-h-screen bg-red-50 font-sans p-10 flex flex-col items-center">
            <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-2xl shadow-red-200/50 p-12 border border-red-100">
                <header className="flex justify-between items-start mb-12">
                   <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl shadow-red-200">🚨</div>
                   <div className="text-right">
                      <h1 className="text-2xl font-black uppercase tracking-tighter italic text-red-600">Reporte de Alerta</h1>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Seguridad Fibex</p>
                   </div>
                </header>

                <div className="space-y-10">
                   <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 border-dashed">
                      <p className="text-sm font-bold text-red-800 leading-relaxed italic">
                         "Se ha detectado una discrepancia entre el personal asignado y el personal presente en sitio. Por favor reporte los detalles a continuación."
                      </p>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Razón de la Inconsistencia</label>
                         <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-red-500 transition-all">
                            <option>Foto no coincide con el rostro</option>
                            <option>Técnico no cuenta con identificación</option>
                            <option>Comportamiento sospechoso</option>
                            <option>Vehículo no oficial</option>
                         </select>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Detalles Adicionales</label>
                         <textarea 
                            rows={4}
                            placeholder="Describa brevemente lo ocurrido..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                         ></textarea>
                      </div>
                   </div>

                   <button className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-xl hover:bg-red-700 transition-all active:scale-95">
                      Enviar Reporte Crítico
                   </button>
                </div>
            </div>
            <p className="mt-12 text-[8px] font-black text-red-300 uppercase tracking-[0.5em]">Este reporte será enviado de inmediato al Centro de Operaciones Fibex</p>
        </div>
    );
};

export default InconsistencyReport;
