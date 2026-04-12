import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface ClientVerificationProps {
  readonly onReport: () => void;
}

interface TechnicianFromToken {
  sub: string;
  nombre: string;
  documento: string;
  pais: string;
  nivel: string;
  foto?: string;
}

/**
 * Pantalla 3.1: Verificación de Identidad (Flujo del Cliente)
 */
export const ClientVerification: React.FC<ClientVerificationProps> = ({ onReport }) => {
  const [techData, setTechData] = useState<TechnicianFromToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // En un escenario real, el token viene en la URL: ?token=...
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('No se proporcionó un token de verificación válido.');
      setLoading(false);
      return;
    }

    apiService.validateQR(token)
      .then((data) => {
        setTechData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error validating token:', err);
        setError('El código QR ha expirado o no es válido.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Verificando identidad del personal...</p>
      </div>
    );
  }

  if (error || !techData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center">
        <div className="bg-red-100 p-6 rounded-full text-red-600 mb-6 shadow-md animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-red-800 mb-2">¡ALERTA DE SEGURIDAD!</h2>
        <p className="text-red-700 font-bold text-lg mb-4">IDENTIDAD NO CONFIRMADA</p>
        <p className="text-red-600 font-medium mb-8 max-w-md bg-white p-4 rounded-xl border border-red-200 shadow-sm">
          {error || 'Por su seguridad, NO PERMITA el ingreso de esta persona a su domicilio y contacte a las autoridades.'}
        </p>
        <div className="flex flex-col w-full max-w-xs space-y-4">
          <button
            onClick={() => window.location.href = 'tel:911'}
            className="bg-red-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-red-800 transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>🚨 LLAMAR A EMERGENCIAS</span>
          </button>
          <button
            onClick={() => window.location.href = 'https://www.fibextelecom.com/soporte'}
            className="bg-white text-red-700 border-2 border-red-700 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-all"
          >
            CONTACTAR SOPORTE FIBEX
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
      {/* Success Banner */}
      <div className="bg-green-700 text-white p-4 text-center shadow-lg flex items-center justify-center space-x-3 sticky top-0 z-10" style={{ backgroundColor: '#1B5E20' }}>
        <div className="bg-white/20 p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-lg font-black tracking-widest uppercase italic">Personal Verificado</span>
      </div>

      {/* Main Profile Card */}
      <main className="flex-grow p-6 flex flex-col items-center">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden mt-2 border border-gray-100 relative">
          {/* Watermark/Seal */}
          <div className="absolute top-4 right-4 opacity-10 rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <div className="p-8 flex flex-col items-center space-y-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-36 h-36 rounded-full border-4 border-green-500 overflow-hidden shadow-2xl bg-gray-50">
                <img 
                  src={techData.foto || `https://i.pravatar.cc/150?u=${techData.sub}`} 
                  alt={techData.nombre} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Tech Info */}
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-extrabold text-navy-900" style={{ color: '#0D47A1' }}>{techData.nombre}</h2>
              <p className="text-gray-500 font-bold uppercase tracking-tighter">Técnico Nivel {techData.nivel} • {techData.pais}</p>
            </div>

            {/* Verification Info */}
            <div className="w-full bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-700 font-black uppercase tracking-widest">Validado el</span>
                <span className="font-mono font-bold text-blue-900 bg-white px-2 py-1 rounded-md shadow-sm">{timestamp}</span>
              </div>
              <div className="h-px bg-blue-100"></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Cédula / ID</span>
                <span className="font-black text-navy-900 tracking-tight">{techData.documento}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Código Empleado</span>
                <span className="font-mono font-bold text-navy-700">{techData.sub}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Corporación</span>
                <span className="font-extrabold text-[#0D47A1] flex items-center">
                  Fibex Telecom 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Action */}
        <div className="mt-8 w-full max-w-sm px-4 text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="h-px bg-gray-200 flex-grow"></div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] whitespace-nowrap">Canal de Emergencia</p>
            <div className="h-px bg-gray-200 flex-grow"></div>
          </div>
          
          <button
            onClick={onReport}
            className="w-full flex items-center justify-center space-x-3 bg-red-600 text-white font-black px-8 py-5 rounded-2xl hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="uppercase tracking-tight text-lg">Reportar Inconsistencia</span>
          </button>
          
          <p className="mt-4 text-xs text-gray-500 font-medium">
            Si nota algo extraño en el uniforme o comportamiento, use el botón rojo.
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-[9px] font-black tracking-widest uppercase">
        <p>© 2026 Fibex Qr Tecnicos • SISTEMA ANTI-PHISHING INTEGRAL • V2.1</p>
      </footer>
    </div>
  );
};

export default ClientVerification;
