import React from 'react';

interface QRDisplayProps {
  readonly qrCode: string;
  readonly expirySeconds: number;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ qrCode, expirySeconds }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Secure Identity QR</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Authorized Field Agent Protocol</p>
      </div>

      <div className="relative group p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 border border-slate-100 transform transition-transform group-hover:scale-[1.02] duration-500">
           {}
           <img 
             src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`} 
             alt="Access QR" 
             className="w-full h-full object-contain mix-blend-multiply"
           />
           
           <div className="absolute top-0 right-0 p-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
           </div>
        </div>
      </div>

      <div className="mt-12 w-full space-y-4">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiration</span>
          <div className="flex items-center space-x-2">
             <span className="text-sm font-black text-blue-600 italic">{Math.floor(expirySeconds / 60)}:{(expirySeconds % 60).toString().padStart(2, '0')}</span>
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">MIN</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 border-dashed">
           <p className="text-[9px] text-blue-700 font-bold uppercase leading-relaxed text-center tracking-tight">
             This code is unique, encrypted via TrustLayer, and authorized only for official client verification.
           </p>
        </div>
      </div>

      <p className="mt-10 text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Fibex Security Gate v5.0 Master</p>
    </div>
  );
};

export default QRDisplay;
