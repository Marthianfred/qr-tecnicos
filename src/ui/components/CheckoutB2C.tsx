import React, { useState } from 'react';
import { Product } from '../../data/mockData';

interface CheckoutB2CProps {
  readonly items: { product: Product, quantity: number }[];
  readonly total: number;
  readonly onBack?: () => void;
}

/**
 * CheckoutB2C Component
 * Optimized for Carlos (End Client) - Frictionless one-step checkout.
 */
const CheckoutB2C: React.FC<CheckoutB2CProps> = ({ items, total, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
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
    
    // Simple Validation
    if (!formData.email || !formData.fullName || !formData.address || !formData.cardNumber) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (err) {
      setError('Hubo un error al procesar tu pago. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#1A237E] mb-2">¡Pedido Confirmado!</h2>
        <p className="text-gray-600 text-center mb-6">Gracias por tu compra, Carlos. Hemos enviado los detalles a {formData.email}.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#2962FF] text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 font-sans">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-[#1A237E]">Checkout Seguro</h1>
        {onBack && (
          <button onClick={onBack} className="text-[#2962FF] font-bold hover:underline">
            Volver al Carrito
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-[#1A237E] mb-4">1. Información de Contacto</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="carlos@ejemplo.com"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A237E] mb-4">2. Detalles de Envío</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Carlos Pérez"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-bold text-gray-700 mb-1">Dirección de Envío *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle Principal #123, Ciudad"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1A237E] mb-4">3. Información de Pago</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-bold text-gray-700 mb-1">Número de Tarjeta *</label>
                <input
                  id="cardNumber"
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-bold text-gray-700 mb-1">Expiración (MM/AA) *</label>
                  <input
                    id="expiry"
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="12/26"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="block text-sm font-bold text-gray-700 mb-1">CVC *</label>
                  <input
                    id="cvc"
                    type="text"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-[#C62828] text-[#C62828] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-md font-bold text-white text-lg shadow-lg transition-all flex items-center justify-center
              ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#2962FF] hover:bg-blue-700 active:transform active:scale-[0.98]'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : 'Completar Compra'}
          </button>
        </form>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 sticky top-8">
            <h2 className="text-lg font-bold text-[#1A237E] mb-4 border-b pb-2">Resumen del Pedido</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.product.name} (x{item.quantity})</span>
                  <span className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío Express</span>
                <span className="font-semibold text-green-600">Gratis</span>
              </div>
            </div>
            <div className="border-t pt-4 flex justify-between items-center mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-[#1A237E]">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Transacción segura protegida por SSL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutB2C;
