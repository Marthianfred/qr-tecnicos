import React, { useState } from 'react';

interface Task {
  id: string;
  client: string;
  address: string;
  type: 'installation' | 'repair' | 'maintenance';
  status: 'pending' | 'in-progress' | 'completed';
}

const TechnicianDashboard: React.FC = () => {
  const [tasks] = useState<Task[]>([
    { id: '1', client: 'Alice Johnson', address: '123 Fiber St', type: 'installation', status: 'pending' },
    { id: '2', client: 'Bob Smith', address: '456 Signal Ave', type: 'repair', status: 'in-progress' },
  ]);

  const [qrVisible, setQrVisible] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <header className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Field Agent Console</h1>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Fibex Operational Protocol v5.0</p>
        </div>
        <button 
          onClick={() => setQrVisible(!qrVisible)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active:scale-95"
        >
          {qrVisible ? 'Close Identity' : 'Generate Verification QR'}
        </button>
      </header>

      <main className="p-10 max-w-5xl mx-auto space-y-12">
        {qrVisible && (
          <div className="bg-white rounded-[2.5rem] p-12 text-slate-900 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Official Identification</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Scan for client security verification</p>
            
            <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl relative group">
               <div className="absolute inset-0 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-64 h-64 bg-white rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <img src="/qr-placeholder.png" alt="Identity QR" className="w-full h-full object-contain p-4" />
               </div>
            </div>

            <div className="mt-10 text-center space-y-2">
               <div className="flex items-center space-x-2 justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <p className="text-xs font-black uppercase tracking-widest">Live Authorization Token</p>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase italic">Expires in: 14:59 minutes</p>
            </div>
          </div>
        )}

        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Scheduled Assignments</h3>
             <span className="bg-slate-800 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{tasks.length} Active Tasks</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/10 transition-all group active:scale-[0.98] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                       <span className="text-xs font-black uppercase italic tracking-tight">{task.client}</span>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase ${task.type === 'installation' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {task.type}
                       </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{task.address}</p>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className={`text-[9px] font-black uppercase tracking-widest mb-2 ${task.status === 'completed' ? 'text-green-500' : 'text-blue-400 animate-pulse'}`}>
                        {task.status}
                     </span>
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs">➡️</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-600/10 border border-blue-500/20 p-10 rounded-[2.5rem] flex items-center justify-between overflow-hidden relative group">
           <div className="absolute -right-10 -bottom-10 text-white/5 text-9xl transition-transform group-hover:scale-110">🛡️</div>
           <div className="space-y-4 relative z-10">
              <h4 className="text-xl font-black uppercase tracking-tighter italic">Security Protocol Reminder</h4>
              <p className="text-xs text-blue-200/60 max-w-md uppercase tracking-widest font-bold">Always verify client identity before starting any physical installation. Record all inconsistencies through the Emergency Alert interface.</p>
           </div>
           <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative z-10">
              Read Protocols
           </button>
        </section>
      </main>

      <footer className="p-8 text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
         Fibex Telecom • Field Agent Management System • v5.0.0
      </footer>
    </div>
  );
};

export default TechnicianDashboard;
