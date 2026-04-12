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
        <div className="bg-red-100 p-4 rounded-full text-red-600 mb-6 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-800 mb-2">¡ALERTA DE SEGURIDAD!</h2>
        <p className="text-red-600 font-medium mb-8 max-w-md">{error || 'Identidad no confirmada. Por favor, no permita el ingreso.'}</p>
        <button
          onClick={() => window.location.href = 'https://www.fibextelecom.com/soporte'}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all active:scale-95"
        >
          CONTACTAR A SOPORTE
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
      {/* Success Banner */}
      <div className="bg-green-700 text-white p-4 text-center shadow-md flex items-center justify-center space-x-2" style={{ backgroundColor: '#2E7D32' }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-lg font-bold tracking-wide uppercase">Personal Autorizado</span>
      </div>

      {/* Main Profile Card */}
      <main className="flex-grow p-6 flex flex-col items-center">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden mt-4 border border-gray-100">
          <div className="p-8 flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full border-4 border-green-500/20 overflow-hidden shadow-inner bg-gray-50">
              <img 
                src={techData.foto || `https://i.pravatar.cc/150?u=${techData.sub}`} 
                alt={techData.nombre} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Tech Info */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-navy-900" style={{ color: '#1A237E' }}>{techData.nombre}</h2>
              <p className="text-gray-500 font-medium">Técnico Especialista - {techData.pais}</p>
            </div>

            {/* Verification Badges */}
            <div className="flex flex-wrap justify-center gap-2 py-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full border border-green-200 shadow-sm">
                ID VERIFICADA
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-200 shadow-sm">
                NIVEL {techData.nivel.toUpperCase()}
              </span>
            </div>

            {/* Details Table */}
            <div className="w-full border-t border-gray-100 pt-6 mt-2 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Documento de Identidad</span>
                <span className="font-bold text-navy-900">{techData.documento}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">ID de Empleado</span>
                <span className="font-mono text-navy-900">{techData.sub}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Empresa</span>
                <span className="font-bold text-navy-900 flex items-center">
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
        <div className="mt-8 text-center px-4">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-4">Canales de Seguridad</p>
          <button
            onClick={onReport}
            className="flex items-center space-x-2 text-red-600 font-bold border-2 border-red-600 px-8 py-3 rounded-xl hover:bg-red-50 transition-all active:scale-95 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="uppercase tracking-tight">Reportar Inconsistencia</span>
          </button>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-[10px] font-medium">
        <p>© 2026 Fibex Qr Tecnicos - PROTECCIÓN DE IDENTIDAD TRIPLE PLAY</p>
      </footer>
    </div>
  );
};

export default ClientVerification;
