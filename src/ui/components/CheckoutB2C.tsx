import React, { useState } from 'react';
import { Product } from '../../data/mockData';

interface CheckoutB2CProps {
  readonly items: { product: Product, quantity: number }[];
  readonly total: number;
  readonly onBack?: () => void;
}

const CheckoutB2C: React.FC<CheckoutB2CProps> = ({ items, total, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    address: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName || !formData.address || !formData.cardNumber) {
      setError('Faltan campos de protocolo requeridos para la autorización.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (err) {
      setError('Transmission failure. Protocol error.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface_container_lowest rounded-lg shadow-ambient max-w-md mx-auto mt-20 no-border animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-8">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-display font-extrabold text-on_surface uppercase tracking-tight mb-4">Autorización Aprobada</h2>
        <p className="text-sm font-medium text-on_surface opacity-50 text-center mb-10 tracking-tight leading-relaxed">Su solicitud de provisión ha sido registrada y autorizada. Detalles transmitidos a {formData.email}.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="trust-gradient text-white px-10 py-4 rounded-lg font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 font-sans text-on_surface bg-surface min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="flex items-center space-x-4">
           <img src="/logo.webp" alt="Fibex Logo" className="h-14 w-auto" />
           <div className="h-10 w-px bg-on_surface/10"></div>
           <div>
              <h1 className="text-3xl font-display font-extrabold text-on_surface uppercase tracking-tighter leading-none">Autorización de Seguridad</h1>
              <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">Etapa Final de Autorización de Provisión</p>
           </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-primary font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-70 transition-all no-border">
            Volver a la Bóveda
          </button>
        )}
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-xs font-display font-extrabold text-primary uppercase tracking-[0.2em] border-b border-primary/5 pb-2">01 Manifiesto de Identificación</h2>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Vector de Contacto (Email)</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="IDENTITY@DOMAIN.COM"
                  className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-display font-extrabold text-primary uppercase tracking-[0.2em] border-b border-primary/5 pb-2">02 Coordenadas de Despliegue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="fullName" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Designación Legal Completa</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="AUTHORIZED PERSONNEL NAME"
                  className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Protocolo de Destino (Dirección)</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="ZONE-ID, SECTOR-NUM, GRID-REF"
                  className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-display font-extrabold text-primary uppercase tracking-[0.2em] border-b border-primary/5 pb-2">03 Transferencia de Recursos</h2>
            <div className="bg-surface_container_low p-8 rounded-lg space-y-8 no-border">
              <div className="space-y-2">
                <label htmlFor="cardNumber" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Número de Instrumento de Crédito</label>
                <input
                  id="cardNumber"
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="expiry" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Válido Hasta (MM/AA)</label>
                  <input
                    id="expiry"
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="12/28"
                    className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cvc" className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-[0.2em] block ml-1">Clave de Seguridad (CVC)</label>
                  <input
                    id="cvc"
                    type="text"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="XXX"
                    className="w-full p-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-bold uppercase tracking-widest input-ghost-border no-border"
                  />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="p-5 bg-error/10 text-error text-[10px] font-display font-extrabold uppercase tracking-widest rounded-lg no-border animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-lg text-white font-display font-extrabold text-xs uppercase tracking-[0.3em] shadow-lg transition-all flex items-center justify-center no-border
              ${isLoading ? 'bg-surface_container_highest text-on_surface/20 cursor-not-allowed' : 'trust-gradient hover:opacity-90 active:scale-95'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-4 h-5 w-5 text-white" xmlns="http:
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transmitiendo Protocolo...
              </>
            ) : 'Iniciar Transferencia Soberana'}
          </button>
        </form>

        {}
        <div className="lg:col-span-1">
          <div className="bg-surface_container_lowest p-8 rounded-lg shadow-ambient no-border sticky top-12 space-y-10">
            <div className="space-y-1">
               <h2 className="text-xs font-display font-extrabold text-on_surface uppercase tracking-[0.2em]">Manifiesto de Activos</h2>
               <div className="h-px bg-on_surface/5"></div>
            </div>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start">
                  <div className="space-y-0.5">
                     <span className="block text-[10px] font-display font-extrabold uppercase tracking-tight text-on_surface">{item.product.name}</span>
                     <span className="block text-[9px] font-bold opacity-30 uppercase tracking-widest">Cantidad: {item.quantity.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-xs font-display font-extrabold text-primary tracking-tighter">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Protocolo Logístico</span>
                <span className="text-[10px] font-display font-extrabold text-primary uppercase tracking-widest">Incluido</span>
              </div>
            </div>
            
            <div className="pt-8 border-t border-on_surface/5 flex justify-between items-end">
              <span className="text-[10px] font-display font-extrabold uppercase tracking-[0.3em]">Magnitud Total</span>
              <span className="text-3xl font-display font-extrabold text-primary tracking-tighter">${total.toFixed(2)}</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4 pt-6">
               <img src="/favicon.svg" alt="Trust" className="h-6 w-6 opacity-20 grayscale" />
               <p className="text-[8px] text-center text-on_surface opacity-20 font-bold uppercase tracking-[0.5em]">
                  Encriptación de Extremo a Extremo Activa
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutB2C;
