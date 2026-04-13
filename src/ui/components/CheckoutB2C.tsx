import React, { useState } from 'react';

interface CheckoutB2CProps {
  readonly total: number;
  readonly onCancel: () => void;
  readonly onSuccess: () => void;
}

export const CheckoutB2C: React.FC<CheckoutB2CProps> = ({ total, onCancel, onSuccess }) => {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      <header className="p-8 flex items-center bg-white border-b border-slate-100 relative z-10 transition-all">
        <button 
          onClick={onCancel} 
          className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 active:scale-95 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-6">
           <h1 className="text-2xl font-black uppercase tracking-tighter italic">Pasarela Segura</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Protocolo de Verificación de Pago v5.0</p>
        </div>
      </header>

      <main className="flex-grow p-10 max-w-2xl mx-auto w-full">
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] mb-12 shadow-2xl relative overflow-hidden group">
           <div className="absolute right-0 bottom-0 text-white/5 text-9xl transition-transform group-hover:scale-110">💳</div>
           <div className="relative z-10 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">Inversión Consolidada</p>
              <h2 className="text-5xl font-black italic tracking-tighter">${total.toFixed(2)}</h2>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 italic">Inteligencia de Facturación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Legal Completo</label>
                  <input required placeholder="Nombre del propietario principal" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ID Oficial / RIF / TAX-ID</label>
                  <input required placeholder="Documento de Identificación" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Identidad Digital (Email)</label>
               <input type="email" required placeholder="nombre@corporativo.com" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
            </div>

            <div className="pt-10">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center relative overflow-hidden"
              >
                {processing ? (
                  <div className="flex items-center space-x-4">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Autenticando Transmisión...</span>
                  </div>
                ) : (
                  'Autorizar y Finalizar Orden'
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-16 flex items-center justify-center space-x-10 grayscale opacity-30">
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 w-auto" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 w-auto" />
           <div className="h-6 w-px bg-slate-300"></div>
           <p className="text-[8px] font-black uppercase tracking-widest leading-none">Protocolo Seguro<br/>TrustLayer</p>
        </div>
      </main>

      <footer className="p-10 text-center opacity-30 mt-auto border-t border-slate-50">
         <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.4em]">Logística Estratégica Fibex • Conexión Segura Activa • v5.0.0</p>
      </footer>
    </div>
  );
};

export default CheckoutB2C;
