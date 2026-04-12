import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Product, MOCK_PRODUCTS } from '../../data/mockData';

interface ProductCatalogProps {
  readonly onAddToCart: (product: Product) => void;
  readonly onViewCart: () => void;
}

/**
 * Componente de Catálogo de Productos para Carlos (Cliente Final)
 */
export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToCart, onViewCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    apiService.getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('API fetch failed, using mock data:', err);
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
        setError('Connection issues detected. Defaulting to local manifest.');
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['Todas', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on_surface">
      {/* Header del Catálogo */}
      <header className="bg-surface_container_lowest p-8 shadow-ambient sticky top-0 z-10 flex justify-between items-center no-border">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
             <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
             <h1 className="text-2xl font-display font-extrabold tracking-tight uppercase">Service <span className="text-primary">Manifest</span></h1>
          </div>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Authorized Provisions Portal</p>
        </div>
        <button 
          onClick={onViewCart}
          className="trust-gradient text-white px-6 py-3 rounded-lg font-display font-extrabold flex items-center space-x-3 shadow-lg hover:opacity-90 transition-all uppercase text-xs tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Vault</span>
        </button>
      </header>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto p-8 bg-surface_container_low border-none space-y-6">
        {error && (
          <div className="p-4 bg-error/10 text-error rounded-lg flex justify-between items-center no-border animate-pulse">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-[10px] font-display font-extrabold uppercase tracking-widest">{error}</span>
            </div>
            <button 
              onClick={loadProducts}
              className="text-[10px] font-display font-extrabold uppercase tracking-widest underline"
            >
              Re-Establish Connection
            </button>
          </div>
        )}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search assets and utility protocols..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-surface_container_highest text-on_surface rounded-lg focus:ring-1 ring-primary/20 outline-none no-border font-display font-extrabold uppercase tracking-widest text-[10px]"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on_surface opacity-30 absolute left-4 top-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex bg-surface_container_highest p-1 rounded-sm no-border overflow-x-auto whitespace-nowrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-sm text-[10px] font-display font-extrabold uppercase tracking-widest transition-all ${
                  selectedCategory === category 
                    ? 'trust-gradient text-white shadow-md' 
                    : 'text-on_surface opacity-40 hover:opacity-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto p-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="bg-surface_container_highest/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto opacity-20">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-[10px] font-display font-extrabold opacity-30 uppercase tracking-[0.4em]">No records in current scope</h3>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
              className="text-[10px] font-display font-extrabold text-primary uppercase tracking-widest underline decoration-2 underline-offset-4"
            >
              Reset Protocols
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-surface_container_lowest rounded-lg overflow-hidden shadow-ambient hover:scale-[1.02] transition-all no-border group flex flex-col">
                <div className="relative overflow-hidden h-56 bg-surface_container_high">
                   <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-surface_container_lowest/80 glassmorphism px-3 py-1 rounded-sm text-[9px] font-display font-extrabold text-primary uppercase tracking-widest no-border">
                        {product.category}
                     </span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-lg font-display font-extrabold text-on_surface uppercase tracking-tight leading-tight">{product.name}</h3>
                    <div className="text-right">
                       <span className="block text-[8px] font-bold opacity-30 uppercase tracking-widest">Rate</span>
                       <span className="text-lg font-display font-extrabold text-primary tracking-tighter">
                        ${product.price.toFixed(2)}
                       </span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-on_surface opacity-50 flex-grow tracking-tight leading-relaxed">
                    {product.description}
                  </p>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-surface_container_highest text-primary py-4 rounded-lg font-display font-extrabold text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all active:scale-95 no-border shadow-sm flex items-center justify-center space-x-3"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Acquire Asset</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Informativo */}
      <footer className="p-12 mt-20 text-center space-y-4 bg-surface_container_low">
         <div className="h-px bg-on_surface/5 max-w-xs mx-auto"></div>
         <p className="text-on_surface opacity-10 font-display font-extrabold text-[8px] uppercase tracking-[0.5em]">
            Digital Commerce Infrastructure • Triple Play Deployment v1.4
         </p>
      </footer>
    </div>
  );
};

export default ProductCatalog;
