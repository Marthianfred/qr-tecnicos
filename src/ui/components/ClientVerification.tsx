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
        setError('El código QR ha caducado o no es válido.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-on_surface opacity-50 font-display font-bold uppercase tracking-widest text-xs">Autenticando Personal...</p>
      </div>
    );
  }

  if (error || !techData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 text-center">
        <div className="bg-error/10 p-8 rounded-full text-error mb-8 shadow-ambient glow-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-4xl font-display font-extrabold text-on_surface tracking-tighter mb-2 uppercase">Alerta de Seguridad</h2>
        <p className="text-error font-display font-bold text-xl mb-6 tracking-tight uppercase">Identidad No Verificada</p>
        <div className="text-on_surface opacity-70 font-medium mb-10 max-w-md bg-surface_container_low p-6 rounded-lg shadow-ambient no-border">
          {error || 'Personal no encontrado en el registro oficial. NO permita la entrada y contacte con los protocolos de seguridad inmediatamente.'}
        </div>
        <div className="flex flex-col w-full max-w-xs space-y-4">
          <button
            onClick={() => window.location.href = 'tel:911'}
            className="bg-error text-white px-8 py-4 rounded-lg font-display font-extrabold shadow-ambient hover:opacity-90 transition-all active:scale-95 flex items-center justify-center space-x-2 tracking-tight"
          >
            <span>LLAMAR A EMERGENCIAS (911)</span>
          </button>
          <button
            onClick={() => window.location.href = 'https://www.fibextelecom.com/soporte'}
            className="bg-surface_container_highest text-on_surface px-8 py-3 rounded-lg font-display font-extrabold hover:bg-surface_container_high transition-all uppercase text-xs tracking-widest"
          >
            Contactar Soporte
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-on_surface">
      {/* Success Banner */}
      <div className="glassmorphism text-primary p-5 text-center shadow-ambient flex items-center justify-center space-x-3 sticky top-0 z-10 no-border">
        <div className="bg-primary/20 p-1 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-sm font-display font-extrabold tracking-[0.2em] uppercase italic">Personal Verificado</span>
      </div>

      {/* Main Profile Card */}
      <main className="flex-grow p-6 flex flex-col items-center bg-surface_container_low">
        <div className="w-full max-w-sm bg-surface_container_lowest rounded-lg shadow-ambient overflow-hidden mt-4 no-border relative">
          {/* Watermark/Seal */}
          <div className="absolute top-8 right-8 opacity-[0.03] rotate-12">
            <img src="/favicon.png" alt="Seal" className="w-48 h-48" />
          </div>

          <div className="p-10 flex flex-col items-center space-y-8 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-[6px] border-primary/10 overflow-hidden shadow-ambient bg-surface_container">
                <img 
                  src={techData.foto || `https://i.pravatar.cc/150?u=${techData.sub}`} 
                  alt={techData.nombre} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 trust-gradient text-white p-2.5 rounded-full shadow-lg border-4 border-surface_container_lowest">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Tech Info */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-display font-extrabold text-on_surface tracking-tighter leading-none">{techData.nombre}</h2>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-[10px] font-bold text-on_surface opacity-40 uppercase tracking-widest">Especialista de Campo</span>
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="bg-surface_container_highest px-2 py-0.5 rounded-sm flex items-center space-x-1">
                  <span className="text-[10px] font-display font-extrabold text-primary uppercase tracking-tight">{techData.pais}</span>
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="w-full bg-surface_container_low rounded-lg p-6 space-y-4 no-border">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.15em]">Fecha de Validación</span>
                <span className="font-display font-extrabold text-[10px] text-primary tracking-tight">{timestamp}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.15em]">ID Oficial</span>
                <span className="font-display font-extrabold text-xs text-on_surface tracking-tight">{techData.documento}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.15em]">ID de Registro</span>
                <span className="font-display font-extrabold text-xs text-on_surface tracking-tight">{techData.sub}</span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.15em]">Autoridad</span>
                <span className="font-display font-extrabold text-xs text-primary flex items-center">
                  FIBEX TELECOM
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.24.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Action */}
        <div className="mt-12 w-full max-w-sm px-4 text-center">
          <p className="text-[10px] text-on_surface opacity-30 uppercase font-bold tracking-[0.25em] mb-6 whitespace-nowrap">Protocolo de Seguridad de Emergencia</p>
          
          <button
            onClick={onReport}
            className="w-full flex items-center justify-center space-x-3 bg-surface_container_highest text-error font-display font-extrabold px-8 py-5 rounded-lg hover:bg-surface_container_high transition-all active:scale-95 no-border group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:animate-pulse" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="uppercase tracking-tight text-lg">Reportar Anomalía</span>
          </button>
          
          <p className="mt-6 text-[10px] text-on_surface opacity-40 font-bold uppercase tracking-widest">
            Identity Guardian System v4.0.2
          </p>
        </div>
      </main>

      <footer className="p-8 text-center text-on_surface opacity-20 text-[9px] font-bold tracking-[0.3em] uppercase">
        <p>© 2026 TrustLayer Infrastructure • Arquitectura de Confianza</p>
      </footer>
    </div>
  );
};

export default ClientVerification;
