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

/**
 * Componente de Carrito de Compras para Carlos (Cliente Final)
 */
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
  const tax = subtotal * 0.16; // IVA 16%
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
      setError('Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-inter p-6">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-blue-600 font-bold hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Catálogo
        </button>

        <h1 className="text-3xl font-bold text-[#1A237E] mb-8">Tu Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <button 
                  onClick={onBack}
                  className="mt-4 text-[#2962FF] font-bold hover:underline"
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-grow">
                    <h3 className="font-bold text-[#1A237E]">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600"
                        >-</button>
                        <span className="px-4 py-1 font-bold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600"
                        >+</button>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.product.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resumen de Pedido */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-[#1A237E] mb-6 border-b pb-4">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Impuestos (16%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[#1A237E] border-t pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || processing}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center space-x-2 ${
                items.length === 0 || processing 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-[#2962FF] hover:bg-blue-700 active:scale-95'
              }`}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar y Pagar</span>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-gray-400">
              Pago seguro procesado por GDA Pay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
