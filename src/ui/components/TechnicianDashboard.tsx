import React, { useEffect, useState } from 'react';
import { apiService, Technician } from '../services/api';

interface TechnicianDashboardProps {
  readonly onGenerateQR: () => void;
}

/**
 * Pantalla 2.1: Dashboard de Técnico
 */
export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ onGenerateQR }) => {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Para el MVP, usamos un ID fijo 'TECH-001'
    apiService.getTechnician('TECH-001')
      .then((data) => {
        setTechnician(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching technician:', err);
        setError('No se pudo cargar la información del técnico');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-4 text-center">
        <p className="text-error font-display font-bold mb-4">{error || 'Técnico no encontrado'}</p>
        <button onClick={() => window.location.reload()} className="trust-gradient text-white px-6 py-2 rounded-lg font-bold">
          REINTENTAR
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans">
      {/* Header */}
      <header className="bg-surface_container_lowest p-6 flex justify-between items-center shadow-ambient no-border">
        <div className="flex items-center space-x-3">
          <img src="/favicon.svg" alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-display font-extrabold tracking-tight text-on_surface uppercase">Fibex <span className="text-primary">Operaciones</span></h1>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-sm font-display font-bold text-on_surface tracking-tight">{technician.name}</p>
          <div className="flex items-center space-x-2 glassmorphism px-2 py-0.5 rounded-full">
            <span className={`w-2 h-2 rounded-full ${technician.status === 'ACTIVO' ? 'bg-green-500 glow-pulse' : 'bg-red-500'}`}></span>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${technician.status === 'ACTIVO' ? 'text-primary' : 'text-error'}`}>{technician.status}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 space-y-12 bg-surface_container_low">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-extrabold text-on_surface tracking-tighter">PORTAL DE AUTENTICACIÓN</h2>
          <p className="text-sm text-on_surface opacity-50 uppercase tracking-widest font-bold italic">Generador de Token Seguro</p>
        </div>

        <button
          onClick={onGenerateQR}
          disabled={technician.status !== 'ACTIVO'}
          className={`w-72 h-72 rounded-full text-white shadow-ambient flex flex-col items-center justify-center space-y-4 transition-all active:scale-95 no-border ${
            technician.status === 'ACTIVO' ? 'trust-gradient hover:opacity-90' : 'bg-surface_container_highest grayscale cursor-not-allowed text-on_surface opacity-30'
          }`}
        >
          <div className="bg-white bg-opacity-10 p-6 rounded-full glassmorphism">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <span className="text-xl font-display font-extrabold text-center px-8 tracking-tight">EMITIR QR DINÁMICO</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-surface_container_lowest p-8 no-border">
        <div className="max-w-md mx-auto">
          <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.4em]">Protocolo Fibex Seguridad v5.0</p>
          <h3 className="text-[10px] font-bold text-on_surface opacity-40 uppercase tracking-[0.2em] mb-4">Certificationes Oficiales</h3>
          <div className="flex flex-wrap gap-3">
            {technician.certificaciones && technician.certificaciones.map((cert: any, idx: number) => (
              <span key={idx} className="px-4 py-2 bg-surface_container_highest text-primary text-[10px] font-display font-extrabold rounded-sm uppercase tracking-wider">
                {cert.nivel}
              </span>
            ))}
            {(!technician.certificaciones || technician.certificaciones.length === 0) && (
              <span className="text-xs text-on_surface opacity-30 italic">No se encontraron certificaciones en el registro</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechnicianDashboard;
