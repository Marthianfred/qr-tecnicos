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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <p className="text-red-600 font-bold mb-4">{error || 'Técnico no encontrado'}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-navy-900 text-white p-4 flex justify-between items-center shadow-md" style={{ backgroundColor: '#1A237E' }}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-navy-900 font-bold">F</span>
          </div>
          <h1 className="text-xl font-bold">Fibex Qr Tecnicos</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{technician.nombre}</p>
          <div className="flex items-center justify-end space-x-1">
            <span className={`w-2 h-2 rounded-full ${technician.status === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-xs ${technician.status === 'ACTIVO' ? 'text-green-400' : 'text-red-400'}`}>{technician.status}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 space-y-8">
        <button
          onClick={onGenerateQR}
          disabled={technician.status !== 'ACTIVO'}
          className={`w-64 h-64 rounded-full text-white shadow-2xl flex flex-col items-center justify-center space-y-4 transition-transform active:scale-95 ${
            technician.status === 'ACTIVO' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          style={technician.status === 'ACTIVO' ? { backgroundColor: '#2962FF' } : {}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-xl font-bold text-center px-4">GENERAR QR DE VISITA</span>
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-white p-4 border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Certificaciones Actuales</h3>
          <div className="flex space-x-2">
            {technician.certificaciones && technician.certificaciones.map((cert: any, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {cert.nivel}
              </span>
            ))}
            {(!technician.certificaciones || technician.certificaciones.length === 0) && (
              <span className="text-xs text-gray-400">Sin certificaciones activas</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TechnicianDashboard;
