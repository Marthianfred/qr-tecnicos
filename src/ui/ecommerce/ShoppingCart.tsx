import React from 'react';

interface ShoppingCartProps {
  readonly items: any[];
  readonly onRemove: (id: string) => void;
  readonly onCheckout: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, onRemove, onCheckout }) => {
  const total = items.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-slate-100 flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
        <div>
           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Resumen de Orden</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Protocolo de Adquisición v5.0</p>
        </div>
        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{items.length} Unidades</span>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 custom-scrollbar pr-2 mb-10">
        {items.length > 0 ? items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">📦</div>
              <div>
                <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{item.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Origen Global • SKU-{item.id.substring(0,4)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
               <span className="text-sm font-black text-slate-900 italic">${item.price.toFixed(2)}</span>
               <button 
                 onClick={() => onRemove(item.id)}
                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </button>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 py-20">
             <div className="text-6xl grayscale opacity-50 mb-4 animate-bounce">🛒</div>
             <p className="text-[11px] font-black uppercase tracking-[0.4em] italic leading-loose">El carrito está vacío.<br/>Favor agregue productos desde el mercado.</p>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-6 pt-8 border-t border-slate-100">
        <div className="space-y-3">
           <div className="flex justify-between items-center text-slate-400 font-bold px-2">
              <span className="text-[10px] uppercase tracking-widest">Valor Neto</span>
              <span className="text-sm tracking-tight">${total.toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-center text-slate-400 font-bold px-2">
              <span className="text-[10px] uppercase tracking-widest">Comisión de Procesamiento</span>
              <span className="text-sm tracking-tight">$0.00</span>
           </div>
           <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 m-0">Total Consolidado</span>
              <span className="text-3xl font-black italic m-0">${total.toFixed(2)}</span>
           </div>
        </div>

        <button 
          onClick={onCheckout}
          disabled={items.length === 0}
          className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 ${items.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
        >
          {items.length > 0 ? 'Iniciar Pago Seguro' : 'Mercado Bloqueado'}
        </button>
        
        <div className="flex items-center justify-center space-x-2 opacity-50">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic leading-none">100% Encriptado vía lógica TrustLayer</p>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
