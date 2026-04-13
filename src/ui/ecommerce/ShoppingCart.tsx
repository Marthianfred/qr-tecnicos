import React, { useState } from 'react';
import { Product } from '../../data/mockData';
import { apiService } from '../services/api';

interface ShoppingCartProps {
  readonly items: { product: Product, quantity: number }[];
  readonly onUpdateQuantity: (productId: string, delta: number) => void;
  readonly onRemove: (productId: string) => void;
  readonly onBack: () => void;
  readonly onOrderComplete: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  onBack,
  onOrderComplete 
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.16; 
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const order = {
        items: items.map(i => ({ id: i.product.id, quantity: i.quantity })),
        total,
        timestamp: new Date().toISOString()
      };
      
      await apiService.createOrder(order);
      setProcessing(false);
      onOrderComplete();
    } catch (err) {
      console.error('Checkout failed:', err);
      setError('Ocurrió un error de transmisión. Por favor, vuelva a autenticar su solicitud.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen font-sans text-on_surface p-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <button 
          onClick={onBack}
          className="flex items-center text-primary font-display font-extrabold text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-all no-border group"
        >
          <svg xmlns="http:
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Aprovisionamiento
        </button>

        <div className="space-y-1">
           <h1 className="text-4xl font-display font-extrabold text-on_surface uppercase tracking-tighter">Bóveda de Transacciones</h1>
           <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Artículos autorizados pendientes de aprobación final</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {}
          <div className="lg:col-span-2 space-y-6">
            {items.length === 0 ? (
              <div className="bg-surface_container_lowest p-20 rounded-lg text-center shadow-ambient no-border space-y-6">
                <div className="bg-surface_container_high w-16 h-16 rounded-full flex items-center justify-center mx-auto opacity-20">
                   <svg xmlns="http:
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-[10px] font-display font-extrabold opacity-30 uppercase tracking-[0.3em]">La bóveda está vacía actualmente</p>
                <button 
                  onClick={onBack}
                  className="text-primary font-display font-extrabold text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-4"
                >
                  Localizar Activos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="bg-surface_container_lowest p-6 rounded-lg shadow-ambient no-border flex items-center gap-6 group hover:bg-surface_container_low transition-colors">
                  <div className="w-24 h-24 overflow-hidden rounded-sm bg-surface_container_high">
                     <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                       <h3 className="font-display font-extrabold text-on_surface uppercase tracking-tight text-sm leading-tight">{item.product.name}</h3>
                       <button 
                        onClick={() => onRemove(item.product.id)}
                        className="text-error opacity-20 hover:opacity-100 transition-opacity p-1"
                      >
                        <svg xmlns="http:
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">{item.product.category}</p>
                    
                    <div className="mt-4 flex items-center justify-between pt-2">
                      <div className="flex items-center bg-surface_container_highest rounded-sm no-border overflow-hidden">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                        >-</button>
                        <span className="px-4 py-1 font-display font-extrabold text-[10px] text-on_surface tracking-widest">{item.quantity.toString().padStart(2, '0')}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-3 py-1 text-primary hover:bg-primary hover:text-white transition-colors"
                        >+</button>
                      </div>
                      <span className="font-display font-extrabold text-primary tracking-tighter">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {}
          <div className="bg-surface_container_low p-8 rounded-lg shadow-ambient no-border h-fit space-y-10">
            <div className="space-y-1">
               <h2 className="text-xs font-display font-extrabold text-on_surface uppercase tracking-[0.2em]">Estado de Cuenta Soberano</h2>
               <div className="h-px bg-on_surface/5"></div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                <span>Sub-Autorización</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                <span>Tarifa de Protocolo (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-6 border-t border-on_surface/5 flex justify-between items-end">
                <span className="text-[10px] font-display font-extrabold uppercase tracking-[0.3em]">Magnitud Bruta</span>
                <span className="text-3xl font-display font-extrabold text-primary tracking-tighter">${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error/10 text-error text-[10px] font-display font-extrabold uppercase tracking-widest rounded-lg no-border animate-pulse">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || processing}
              className={`w-full py-5 rounded-lg text-white font-display font-extrabold text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center justify-center space-x-3 no-border ${
                items.length === 0 || processing 
                  ? 'bg-surface_container_highest text-on_surface/20 cursor-not-allowed' 
                  : 'trust-gradient hover:opacity-90 active:scale-95'
              }`}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Transmitiendo...</span>
                </>
              ) : (
                <span>Autorizar y Aprobar</span>
              )}
            </button>
            
            <div className="flex flex-col items-center space-y-4 pt-4">
               <img src="/favicon.svg" alt="Trust" className="h-6 w-6 opacity-20 grayscale" />
               <p className="text-[8px] text-center text-on_surface opacity-20 font-bold uppercase tracking-[0.4em]">
                  Canal Encriptado v9.0 • Pasarela Segura GDA
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
