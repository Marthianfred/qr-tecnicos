import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface QRDisplayProps {
  readonly onBack: () => void;
}

/**
 * Pantalla 2.2: Visualización de QR Dinámico
 */
export const QRDisplay: React.FC<QRDisplayProps> = ({ onBack }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default

  useEffect(() => {
    apiService.generateQR('TECH-001')
      .then((data) => {
        setToken(data.qr_token);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error generating QR:', err);
        setError('No se pudo generar el QR de seguridad');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p>Generando código seguro...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-navy-900 text-white font-inter" style={{ backgroundColor: '#1A237E' }}>
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-navy-800 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">QR de Visita</h1>
        <div className="w-6" /> {/* Placeholder for alignment */}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 space-y-8 bg-white text-navy-900 rounded-t-3xl mt-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Muestre este código al cliente</h2>
          <p className="text-sm text-gray-500">Válido para una única sesión de verificación.</p>
        </div>

        {error ? (
          <div className="bg-red-50 p-6 rounded-2xl text-red-600 text-center border border-red-100">
            <p className="font-bold">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold">
              REINTENTAR
            </button>
          </div>
        ) : (
          <>
            {/* QR Container with Watermark */}
            <div className="relative p-8 bg-gray-50 rounded-2xl shadow-inner border-2 border-dashed border-gray-200">
              <div className="w-64 h-64 bg-navy-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                {/* Simulation of a QR code using the token as seed for "randomness" */}
                <div className="grid grid-cols-8 gap-1 p-4 opacity-80 w-full h-full">
                  {[...Array(64)].map((_, i) => {
                    const charCode = token ? token.charCodeAt(i % token.length) : i;
                    return (
                      <div key={i} className={`w-full h-full bg-white ${(charCode + i) % 3 === 0 ? 'opacity-100' : 'opacity-10'}`} />
                    );
                  })}
                </div>
                {/* Security Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-45 opacity-20">
                  <span className="text-[10px] font-bold whitespace-nowrap bg-navy-900 px-2">
                    {new Date().toLocaleTimeString()} - {token?.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Este código expirará en:</p>
              <p className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-navy-900'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col w-full space-y-3">
          <button
            onClick={() => {
              if (token) {
                // Simulate scanning the QR by navigating to the verification view with the token
                const url = new URL(window.location.href);
                url.searchParams.set('token', token);
                window.history.pushState({}, '', url.toString());
                // Since we are in a demo SPA, we might need a way to trigger the view change in App.tsx
                // For now, we'll just alert that the URL has been updated for the simulation
                alert('URL actualizada con el token. Para simular el escaneo del cliente, haga clic en el icono 👤 en la esquina inferior derecha.');
              }
            }}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors"
          >
            SIMULAR ESCANEO (DEMO)
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 bg-navy-900 text-white font-bold rounded-xl shadow-lg hover:bg-navy-800 transition-colors"
            style={{ backgroundColor: '#1A237E' }}
          >
            {error ? 'VOLVER AL DASHBOARD' : 'FINALIZAR VISITA'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QRDisplay;
