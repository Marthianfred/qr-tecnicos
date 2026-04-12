import React, { useState } from 'react';
import { apiService } from '../services/api';
import { INCONSISTENCY_REASONS } from '../../data/mockData';

interface InconsistencyReportProps {
  readonly onCancel: () => void;
  readonly onSubmit: (data: { reason: string; details: string }) => void;
}

/**
 * Pantalla 3.2: Reporte de Inconsistencia (Flujo del Cliente)
 */
export const InconsistencyReport: React.FC<InconsistencyReportProps> = ({ onCancel, onSubmit }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;

    setSubmitting(true);
    setError(null);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const techIdFromUrl = urlParams.get('techId') || 'TECH-001';

      await apiService.reportInconsistency(techIdFromUrl, {
        reason: selectedReason,
        details,
      });

      setSubmitting(false);
      onSubmit({ reason: selectedReason, details });
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('No se pudo enviar el reporte. Por favor, intente de nuevo o contacte a soporte.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-on_surface">
      {/* Header */}
      <header className="p-6 flex items-center bg-surface_container_lowest shadow-ambient no-border relative z-10">
        <button onClick={onCancel} className="p-2 glassmorphism rounded-full transition-all text-on_surface opacity-50 hover:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="ml-4 text-xl font-display font-extrabold text-on_surface uppercase tracking-tight">Reporte de Incidente de Seguridad</h1>
      </header>

      {/* Form */}
      <main className="flex-grow p-8 bg-surface_container_low">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-12">
          <div className="space-y-6">
            <div className="space-y-1">
               <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Guardian Protocol 7</h2>
               <p className="text-sm font-medium text-on_surface opacity-50 uppercase tracking-tight">Seleccione la naturaleza de la inconsistencia para investigación inmediata.</p>
            </div>
            
            {error && (
              <div className="bg-error/10 p-4 rounded-lg text-error text-[10px] font-display font-extrabold uppercase tracking-widest no-border">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {INCONSISTENCY_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center p-5 rounded-lg cursor-pointer transition-all no-border ${
                    selectedReason === reason.id 
                      ? 'bg-error text-white shadow-lg scale-[1.02]' 
                      : 'bg-surface_container_lowest text-on_surface opacity-60 hover:opacity-100 shadow-ambient'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    className="hidden"
                    onChange={(e) => setSelectedReason(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-4 ${selectedReason === reason.id ? 'border-white' : 'border-on_surface/20'}`}>
                    {selectedReason === reason.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                  <span className="font-display font-extrabold text-[10px] uppercase tracking-[0.15em]">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="details" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block">
              Detalles de Auditoría (Opcional)
            </label>
            <textarea
              id="details"
              rows={4}
              disabled={submitting}
              className="w-full p-5 bg-surface_container_lowest text-on_surface rounded-lg shadow-ambient no-border focus:ring-1 ring-primary/20 transition-all resize-none disabled:opacity-30 sm:text-xs"
              placeholder="Proporcione contexto para la auditoría de seguridad..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={!selectedReason || submitting}
              className={`w-full py-5 rounded-lg font-display font-extrabold text-white shadow-ambient transition-all flex items-center justify-center tracking-widest uppercase text-xs no-border ${
                selectedReason && !submitting ? 'bg-error hover:opacity-90 active:scale-95' : 'bg-surface_container_high text-on_surface/20 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Transmitir Alerta de Emergencia'
              )}
            </button>
            <p className="mt-6 text-center text-[9px] text-on_surface opacity-30 font-bold uppercase tracking-[0.25em]">
              Esta transmisión está encriptada y registrada por el Comando Central de Fibex.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InconsistencyReport;
