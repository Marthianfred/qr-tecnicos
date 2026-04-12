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
      // En un escenario real, el techId vendría del contexto o de la sesión de verificación previa
      // Para el MVP, intentamos obtenerlo de la URL o usamos un fallback
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
    <div className="flex flex-col min-h-screen bg-white font-inter">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-gray-100">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h1 className="ml-2 text-xl font-bold text-gray-900">Reportar Inconsistencia</h1>
      </header>

      {/* Form */}
      <main className="flex-grow p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <p className="text-gray-600">Su seguridad es nuestra prioridad. Por favor, indíquenos el motivo de su reporte.</p>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {INCONSISTENCY_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedReason === reason.id ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.id}
                    className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                    onChange={(e) => setSelectedReason(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <span className={`ml-3 font-semibold ${selectedReason === reason.id ? 'text-red-700' : 'text-gray-700'}`}>
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="details" className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
              Detalles Adicionales (Opcional)
            </label>
            <textarea
              id="details"
              rows={4}
              disabled={submitting}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-navy-600 focus:ring-0 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Describa brevemente lo ocurrido..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!selectedReason || submitting}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center ${
                selectedReason && !submitting ? 'bg-red-600 hover:bg-red-700 active:scale-95' : 'bg-gray-300 cursor-not-allowed'
              }`}
              style={selectedReason && !submitting ? { backgroundColor: '#C62828' } : {}}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ENVIANDO...
                </>
              ) : (
                'ENVIAR REPORTE DE SEGURIDAD'
              )}
            </button>
            <p className="mt-4 text-center text-xs text-gray-400">
              Este reporte será enviado inmediatamente al Centro de Control de Fibex.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default InconsistencyReport;
