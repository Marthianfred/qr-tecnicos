import React, { useState, useEffect } from 'react';
import TechnicianDashboard from './components/TechnicianDashboard';
import QRDisplay from './components/QRDisplay';
import ClientVerification from './components/ClientVerification';
import InconsistencyReport from './components/InconsistencyReport';
import CoordinatorMonitor from './components/CoordinatorMonitor';
import AdminPanel from './components/AdminPanel';
import CheckoutB2C from './components/CheckoutB2C';
import Login, { UserRole } from './components/Login';
import ProductCatalog from './ecommerce/ProductCatalog';
import ShoppingCart from './ecommerce/ShoppingCart';
import { Product } from '../data/mockData';

type View = 
  | 'login'
  | 'tech-dash' 
  | 'tech-qr' 
  | 'client-verify' 
  | 'client-report' 
  | 'coord-monitor' 
  | 'admin-panel' 
  | 'ecommerce-catalog' 
  | 'ecommerce-cart'
  | 'b2c-checkout';

interface User {
  username: string;
  role: string;
}

/**
 * Main Application Wrapper for Fibex Qr Tecnicos & Ciclo de Negocio
 */
export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [cartItems, setCartItems] = useState<{ product: Product, quantity: number }[]>([]);

  // Redirect based on role after login
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') setCurrentView('admin-panel');
      else if (user.role === 'coordinator') setCurrentView('coord-monitor');
      else if (user.role === 'technician') setCurrentView('tech-dash');
      else setCurrentView('client-verify');
    } else {
      setCurrentView('login');
    }
  }, [user]);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(i => {
      if (i.product.id === productId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.product.id !== productId));
  };

  if (!user || currentView === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Navigation for demo purposes */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-2xl border border-gray-200">
        <div className="pr-2 mr-2 border-r border-gray-200 flex flex-col items-center">
          <span className="text-[10px] font-bold text-[#1A237E] leading-tight capitalize">{user.role}</span>
          <button onClick={handleLogout} className="text-[10px] text-red-600 hover:underline leading-tight">Salir</button>
        </div>

        {/* Role-based navigation buttons */}
        {(user.role === 'admin' || user.role === 'technician') && (
          <button onClick={() => setCurrentView('tech-dash')} className={`p-2 rounded-full transition-colors ${currentView === 'tech-dash' ? 'bg-[#2962FF] text-white' : 'hover:bg-gray-100'}`} title="Técnico Dashboard">🛠️</button>
        )}
        
        {(user.role === 'admin' || user.role === 'client') && (
          <button onClick={() => setCurrentView('client-verify')} className={`p-2 rounded-full transition-colors ${currentView === 'client-verify' ? 'bg-[#2962FF] text-white' : 'hover:bg-gray-100'}`} title="Cliente Verificación">👤</button>
        )}

        {(user.role === 'admin' || user.role === 'coordinator') && (
          <button onClick={() => setCurrentView('coord-monitor')} className={`p-2 rounded-full transition-colors ${currentView === 'coord-monitor' ? 'bg-[#2962FF] text-white' : 'hover:bg-gray-100'}`} title="Coordinador Monitor">🖥️</button>
        )}

        {user.role === 'admin' && (
          <button onClick={() => setCurrentView('admin-panel')} className={`p-2 rounded-full transition-colors ${currentView === 'admin-panel' ? 'bg-[#2962FF] text-white' : 'hover:bg-gray-100'}`} title="Admin Panel">💼</button>
        )}

        {(user.role === 'admin' || user.role === 'client') && (
          <button onClick={() => setCurrentView('ecommerce-catalog')} className={`p-2 rounded-full transition-colors ${currentView === 'ecommerce-catalog' ? 'bg-[#2962FF] text-white' : 'hover:bg-gray-100'}`} title="E-commerce Catálogo">🛒</button>
        )}
      </div>

      <div className="container mx-auto">
        {currentView === 'tech-dash' && (
          <TechnicianDashboard onGenerateQR={() => setCurrentView('tech-qr')} />
        )}

        {currentView === 'tech-qr' && (
          <QRDisplay onBack={() => setCurrentView('tech-dash')} />
        )}

        {currentView === 'client-verify' && (
          <ClientVerification onReport={() => setCurrentView('client-report')} />
        )}

        {currentView === 'client-report' && (
          <InconsistencyReport 
            onCancel={() => setCurrentView('client-verify')} 
            onSubmit={(data) => {
              console.log('Report submitted:', data);
              alert('Reporte enviado con éxito');
              setCurrentView('client-verify');
            }} 
          />
        )}

        {currentView === 'coord-monitor' && (
          <CoordinatorMonitor />
        )}

        {currentView === 'admin-panel' && (
          <AdminPanel />
        )}

        {currentView === 'ecommerce-catalog' && (
          <ProductCatalog 
            onAddToCart={addToCart} 
            onViewCart={() => setCurrentView('ecommerce-cart')} 
          />
        )}

        {currentView === 'ecommerce-cart' && (
          <ShoppingCart 
            items={cartItems} 
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart} 
            onBack={() => setCurrentView('ecommerce-catalog')}
            onOrderComplete={() => {
              setCurrentView('b2c-checkout');
            }}
          />
        )}

        {currentView === 'b2c-checkout' && (
          <CheckoutB2C 
            items={cartItems} 
            total={cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) * 1.16} 
            onBack={() => setCurrentView('ecommerce-cart')}
          />
        )}
      </div>
    </div>
  );
};

export default App;
