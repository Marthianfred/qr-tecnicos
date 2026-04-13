import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../../data/mockData';

interface ProductCatalogProps {
  readonly onAddToCart: (product: any) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onAddToCart }) => {
  const [filter, setFilter] = useState('TODOS');

  const filteredProducts = filter === 'TODOS' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category.toUpperCase() === (filter === 'PLANES' ? 'INTERNET' : 'EQUIPOS'));

  return (
    <div className="bg-slate-50 min-h-screen p-10 font-sans">
      <header className="mb-12 flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Mercado Técnico</h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 italic shadow-sm bg-white px-4 py-1 rounded-full w-fit">Equipos y Planes Fibex Autorizados</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
           {['TODOS', 'PLANES', 'EQUIPOS'].map(cat => (
             <button
               key={cat}
               onClick={() => setFilter(cat)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500">
            <div className="h-56 bg-slate-100 relative overflow-hidden">
               <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black text-slate-900 uppercase tracking-widest shadow-lg">
                  {product.category === 'INTERNET' ? 'PLAN INTERNET' : 'EQUIPO TÉCNICO'}
               </div>
            </div>
            
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">{product.name}</h3>
                 <p className="text-xs text-slate-400 leading-relaxed font-bold">{product.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-300 uppercase italic">Inversión</span>
                   <span className="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => onAddToCart(product)}
                  className="bg-slate-900 hover:bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 group/btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 pt-10 border-t border-slate-200 text-center opacity-30">
         <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em]">Logística Global Fibex v5.0 Master</p>
      </footer>
    </div>
  );
};

export default ProductCatalog;
