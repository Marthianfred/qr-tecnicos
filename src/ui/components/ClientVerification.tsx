import React, { useState } from 'react';

const ClientVerification: React.FC = () => {
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    
    return (
        <div className="min-h-screen bg-white font-sans p-10 flex flex-col items-center">
            <header className="w-full max-w-lg flex justify-between items-center mb-16">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-xl shadow-blue-500/20">F</div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo de Confianza</p>
                   <p className="text-[12px] font-black text-slate-900 uppercase italic">Verificación Fibex</p>
                </div>
            </header>

            <main className="w-full max-w-lg space-y-12">
                <div className="text-center">
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">Validación de Personal</h2>
                    <p className="text-sm text-slate-400 font-bold mt-2">Por favor, verifique la identidad del técnico antes de permitir el acceso.</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-12 shadow-inner text-center">
                    <div className="w-48 h-48 bg-white rounded-full mx-auto mb-10 border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                        <span className="text-6xl grayscale opacity-20">👤</span>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Juan Carlos Perez</h3>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Técnico de Fibra Óptica Senior</p>
                    </div>

                    <div className="mt-10 pt-10 border-t border-slate-200 grid grid-cols-2 gap-4">
                        <div className="text-left">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">DNI / Cédula</p>
                            <p className="text-sm font-black text-slate-900 italic">V-12.345.678</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">País de Operación</p>
                            <p className="text-sm font-black text-slate-900 italic">VENEZUELA</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">
                      Confirmar Identidad
                   </button>
                   <button className="w-full py-6 bg-white text-red-600 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] border border-red-100 hover:bg-red-50 transition-all">
                      No lo reconozco / Alerta
                   </button>
                </div>
            </main>

            <footer className="mt-auto pt-20 text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">
                Fibex Trust Engine • Verificación Segura v5.0 Master
            </footer>
        </div>
    );
};

export default ClientVerification;
