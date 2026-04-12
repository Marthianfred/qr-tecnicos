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
        // We set a non-blocking error message
        setError('No pudimos conectar con el servidor, mostrando datos locales.');
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
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-inter">
      {/* Header del Catálogo */}
      <header className="bg-[#1A237E] text-white p-6 shadow-lg sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo de Servicios GDA</h1>
          <p className="text-sm opacity-80">Selecciona el plan que mejor se adapte a ti</p>
        </div>
        <button 
          onClick={onViewCart}
          className="bg-white text-[#1A237E] px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Carrito</span>
        </button>
      </header>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 border-b border-gray-200">
        {error && (
          <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-700 flex justify-between items-center rounded">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={loadProducts}
              className="text-sm font-bold underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Buscar productos o servicios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-500">No encontramos lo que buscas</h3>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col bg-white">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A237E] mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {product.description}
                  </p>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-[#2962FF] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Añadir al Carrito</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Informativo */}
      <footer className="bg-gray-50 border-t border-gray-200 p-8 mt-12 text-center">
        <p className="text-gray-500 text-sm">© 2026 GDA - Ciclo de Negocio. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default ProductCatalog;
