import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface ClientVerificationProps {
  readonly onReport: () => void;
}

interface TechnicianFromToken {
  sub: string;
  nombre: string;
  documento: string;
  cargo: string;
  empresa: string;
  tipoPersonal: string;
  pais: string;
  nivel: string;
  foto?: string;
}

export const ClientVerification: React.FC<ClientVerificationProps> = ({ onReport }) => {
  const [techData, setTechData] = useState<TechnicianFromToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('Token no proporcionado');
      setLoading(false);
      return;
    }

    apiService.validateQR(token)
      .then((data) => {
        setTechData(data);
        setLoading(false);
      })
      .catch(() => {
        setError('QR expirado o inválido');
        setLoading(false);
      });
      
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-black text-[10px] tracking-widest uppercase">Validando Identidad Digital...</p>
    </div>
  );

  if (error || !techData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-8 text-center">
      <div className="bg-red-100 p-6 rounded-full text-red-600 mb-6 animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl font-black text-red-800 mb-2 uppercase tracking-tighter">ALERTA DE SEGURIDAD</h1>
      <p className="text-red-600 font-bold text-lg mb-8 uppercase">DOCUMENTO NO VÁLIDO</p>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200 max-w-sm mb-10">
        <p className="text-slate-600 font-medium">Este código QR ha expirado o no pertenece al personal autorizado de Fibex Telecom. Favor de contactar a seguridad.</p>
      </div>
      <button onClick={() => window.location.href = 'tel:911'} className="bg-red-600 text-white w-full max-w-xs py-4 rounded-xl font-black shadow-xl active:scale-95 transition-all">LLAMAR AUTORIDADES</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-12 font-sans overflow-x-hidden">
      {/* Institutional Top Bar */}
      <header className="w-full bg-slate-900 h-16 flex items-center justify-between px-6 shadow-xl sticky top-0 z-50">
        <div className="flex items-center space-x-2">
           <img src="/fibex-icon.png" alt="Fibex" className="h-8 w-8 object-contain" />
           <div className="h-6 w-px bg-slate-700"></div>
           <span className="text-white font-black text-[10px] tracking-wider uppercase">Personal Fibex</span>
        </div>
        <div className="bg-blue-600 px-3 py-1 rounded-full flex items-center space-x-2 border border-blue-400">
           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
           <span className="text-white font-black text-[9px] uppercase tracking-tighter">ID Activa</span>
        </div>
      </header>

      {/* Official Status Badge */}
      <div className="w-full bg-green-500 py-3 flex items-center justify-center space-x-3 shadow-inner">
         <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">VALIDACIÓN EXITOSA • PERSONA AUTORIZADA</span>
      </div>

      {/* Main Identity Card */}
      <main className="w-full max-w-sm px-6 mt-8 relative">
        {/* Anti-screenshot Timer */}
        <div className="absolute -top-4 right-8 bg-slate-800 text-white px-3 py-1 rounded-md text-[8px] font-mono z-20 shadow-lg border border-slate-700">
           Sincronización: {time}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 relative">
          {/* Identity Header */}
          <div className="h-32 bg-slate-900 relative flex items-end justify-center">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
             {/* Profile Circle Overlap */}
             <div className="w-40 h-40 rounded-3xl border-[8px] border-white shadow-2xl bg-white overflow-hidden transform translate-y-12 z-10 transition-transform hover:scale-105 duration-500">
                <img 
                  src={techData.foto || `https://i.pravatar.cc/300?u=${techData.sub}`} 
                  alt={techData.nombre} 
                  className="w-full h-full object-cover grayscale-[0.2]" 
                />
             </div>
          </div>

          {/* Technician Info */}
          <div className="pt-20 pb-8 px-8 text-center">
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{techData.nombre}</h2>
             <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-blue-100 italic">{techData.cargo || 'Especialista III'}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{techData.empresa || 'Fibex Services'}</span>
             </div>

             {/* Certificate Medals */}
             <div className="grid grid-cols-4 gap-2 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                {['INICIAL', 'BASICO', 'INTEGRAL', 'PREMIUM'].map((lvl) => {
                  const isActive = techData.nivel?.toUpperCase() === lvl;
                  return (
                    <div key={lvl} className={`flex flex-col items-center space-y-1 ${isActive ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600 shadow-lg' : 'bg-slate-300'}`}>
                          <span className="text-white text-[8px] font-black">🎓</span>
                       </div>
                       <span className="text-[7px] font-black uppercase text-slate-900">{lvl}</span>
                    </div>
                  );
                })}
             </div>

             {/* Official Records Table */}
             <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Documento</span>
                   <span className="text-xs font-black text-slate-900">{techData.documento}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estatus Laboral</span>
                   <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-green-600 uppercase">Activo</span>
                   </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jurisdicción</span>
                   <span className="text-[10px] font-black text-slate-900 italic uppercase">{techData.pais} - LATAM</span>
                </div>
             </div>
          </div>
        </div>

        {/* Support & Audit Footer */}
        <div className="mt-8 space-y-4">
           <button 
             onClick={onReport}
             className="w-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all border border-slate-200 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest">Reportar Incidente de Seguridad</span>
           </button>
           
           <div className="text-center opacity-30">
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">Protocolo Fibex Seguridad v5.0</p>
           </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-auto px-10 text-center">
         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Protegiendo la infraestructura crítica de Fibex Telecom</p>
      </footer>
    </div>
  );
};

export default ClientVerification;
