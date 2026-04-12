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
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-on_surface opacity-50 font-display font-bold uppercase tracking-widest text-xs">Generando Token Seguro...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-on_surface">
      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-surface_container_lowest shadow-ambient no-border">
        <button onClick={onBack} className="p-2 glassmorphism rounded-full transition-all text-primary hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-display font-extrabold tracking-tight uppercase">Protocolo de Visita</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 space-y-12 bg-surface_container_low">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-extrabold tracking-tight">VERIFICACIÓN CIUDADANA</h2>
          <p className="text-[10px] text-on_surface opacity-50 uppercase font-bold tracking-[0.2em]">Muestre este portal al cliente para validar la confianza</p>
        </div>

        {error ? (
          <div className="bg-surface_container_lowest p-8 rounded-lg text-error text-center shadow-ambient no-border">
            <p className="font-display font-bold mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="trust-gradient text-white px-8 py-3 rounded-lg font-bold tracking-tight">
              REINTENTAR
            </button>
          </div>
        ) : (
          <>
            {/* QR Container with Watermark */}
            <div className="relative p-10 bg-surface_container_lowest rounded-lg shadow-ambient no-border group">
              <div className="w-64 h-64 trust-gradient rounded-lg flex items-center justify-center text-white relative overflow-hidden shadow-lg group-hover:scale-[1.02] transition-transform">
                {/* Simulation of a QR code */}
                <div className="grid grid-cols-8 gap-1 p-6 opacity-90 w-full h-full">
                  {[...Array(64)].map((_, i) => {
                    const charCode = token ? token.charCodeAt(i % token.length) : i;
                    return (
                      <div key={i} className={`w-full h-full rounded-sm bg-white ${(charCode + i) % 3 === 0 ? 'opacity-100' : 'opacity-10'}`} />
                    );
                  })}
                </div>
                {/* Security Overlay */}
                <div className="absolute inset-0 glassmorphism opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <img src="/favicon.svg" alt="Seal" className="w-20 h-20 opacity-40" />
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-bold text-on_surface opacity-40 uppercase tracking-widest italic">Vida Útil del Token</p>
              <div className={`text-4xl font-display font-extrabold tracking-tighter ${timeLeft < 60 ? 'text-error glow-pulse' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col w-full max-w-sm space-y-4">
          <button
            onClick={() => {
              if (token) {
                const url = new URL(window.location.href);
                url.searchParams.set('token', token);
                window.history.pushState({}, '', url.toString());
                alert('URL actualizada con el token. Para simular el escaneo del cliente, haga clic en el icono 👤 en la esquina inferior derecha.');
              }
            }}
            className="w-full py-4 bg-surface_container_highest text-primary font-display font-extrabold rounded-lg shadow-ambient hover:bg-surface_container_high transition-all text-xs tracking-[0.15em] uppercase no-border"
          >
            Simular Escaneo del Cliente
          </button>
          <button
            onClick={onBack}
            className="w-full py-4 trust-gradient text-white font-display font-extrabold rounded-lg shadow-ambient hover:opacity-90 transition-all tracking-tight uppercase"
          >
            {error ? 'Volver al Dashboard' : 'Finalizar Protocolo de Visita'}
          </button>
        </div>
      </main>
      
      <footer className="p-6 bg-surface_container_low text-center">
         <div className="inline-flex items-center space-x-2 glassmorphism px-4 py-1.5 rounded-full no-border">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 glow-pulse"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-on_surface opacity-60">Seguridad Rotativa Activa</span>
         </div>
      </footer>
    </div>
  );
};

export default QRDisplay;
