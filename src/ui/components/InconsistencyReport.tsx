import React, { useState } from 'react';
import { apiService } from '../services/api';
import { INCONSISTENCY_REASONS } from '../../data/mockData';

interface InconsistencyReportProps {
  readonly onCancel: () => void;
  readonly onSubmit: (data: { reason: string; details: string }) => void;
}

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
      console.error('Error enviando reporte:', err);
      setError('No se pudo enviar el reporte. Por favor intente de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      <header className="p-8 flex items-center bg-white border-b border-slate-100 relative z-10 transition-all">
        <button 
          onClick={onCancel} 
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="ml-6">
           <h1 className="text-2xl font-black uppercase tracking-tighter italic text-red-600">Reporte de Alerta</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Protocolo de Seguridad Fibex v5.0 Master</p>
        </div>
      </header>

      <main className="flex-grow p-10 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-12 animate-in slide-in-from-bottom-5 duration-500">
          <div className="space-y-8">
            <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 border-dashed">
               <h2 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">Protocolo Guardián v5.0</h2>
               <p className="text-sm font-bold text-red-800/60 uppercase tracking-tight leading-relaxed italic">Seleccione la irregularidad para investigación inmediata por el Centro de Comando Central.</p>
            </div>
            
            {error && (
              <div className="bg-red-600 p-4 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {INCONSISTENCY_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center p-6 rounded-3xl cursor-pointer transition-all border-2 ${
                    selectedReason === reason.id 
                      ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200 scale-[1.02]' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 opacity-60 hover:opacity-100 shadow-sm'
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
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${selectedReason === reason.id ? 'border-white' : 'border-slate-300'}`}>
                    {selectedReason === reason.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest italic leading-none">
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="details" className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
              Detalles de Auditoría (Opcional)
            </label>
            <textarea
              id="details"
              rows={4}
              disabled={submitting}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-xs font-black uppercase outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none shadow-inner"
              placeholder="Describa el contexto para la auditoría de seguridad..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="pt-8">
            <button
              type="submit"
              disabled={!selectedReason || submitting}
              className={`w-full py-6 rounded-[2rem] font-black text-white shadow-xl transition-all flex items-center justify-center tracking-[0.3em] uppercase text-xs ${
                selectedReason && !submitting ? 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-red-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed uppercase'
              }`}
            >
              {submitting ? (
                <div className="flex items-center space-x-4">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Transmitiendo Alerta...</span>
                </div>
              ) : (
                'Transmitir Alerta Crítica'
              )}
            </button>
            <p className="mt-8 text-center text-[8px] text-slate-400 font-black uppercase tracking-[0.4em] italic leading-relaxed">
              Esta transmisión es encriptada y grabada por el Comando Central Fibex vía lógica TrustLayer.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InconsistencyReport;
