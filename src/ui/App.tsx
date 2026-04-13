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

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const [cartItems, setCartItems] = useState<{ product: Product, quantity: number }[]>([]);

  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  
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
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
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
    <div className="min-h-screen bg-surface font-sans text-on_surface overflow-hidden">
      <div className="h-full">
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
          <CoordinatorMonitor onLogout={handleLogout} />
        )}

        {currentView === 'admin-panel' && (
          <AdminPanel onLogout={handleLogout} />
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
