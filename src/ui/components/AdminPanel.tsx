import React, { useState, useEffect } from 'react';
import { apiService, Technician, Cuadrilla } from '../services/api';

type AdminModule = 
  | 'dashboard' 
  | 'companies' 
  | 'personnel' 
  | 'certifications' 
  | 'operations' 
  | 'qr-security' 
  | 'alerts' 
  | 'config';

interface AdminPanelProps {
  onLogout?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'VE' | 'PE' | 'RD'>('ALL');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ technicians: 0, activeQrs: 0, alerts: 0, squads: 0 });

  // Sidebar Menu Definition
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Global', icon: '📊', description: 'Monitor Triple Play' },
    { id: 'companies', label: 'Gestión Corporativa', icon: '🏢', description: 'Empresas y Aliados' },
    { id: 'personnel', label: 'Gestión de Personal', icon: '👥', description: 'Motor de RRHH' },
    { id: 'certifications', label: 'Historial Académico', icon: '🎓', description: 'Reglas de Bloqueo' },
    { id: 'operations', label: 'Cuadrillas y Campo', icon: '🚙', description: 'Logística de Despliegue' },
    { id: 'qr-security', label: 'Centro de Seguridad', icon: '🛡️', description: 'Auditoría TrustLayer' },
    { id: 'alerts', label: 'Alertas y Reportes', icon: '🚨', description: 'Bandeja de Incidentes' },
    { id: 'config', label: 'Configuración', icon: '⚙️', description: 'Accesos y Seguridad' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR: Corporate Deep Blue */}
      <aside className="w-80 bg-[#001F3D] text-white flex flex-col shadow-2xl z-30 h-full">
        <div className="p-8 border-b border-white/10 flex flex-col items-center flex-shrink-0">
          <img src="/logo.webp" alt="Fibex" className="h-16 w-auto mb-4" />
          <div className="text-center">
             <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Fibex <span className="text-blue-400">Qr Técnicos</span></h1>
             <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em] mt-1">Consola de Gobernanza</p>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 group ${
                activeModule === item.id 
                  ? 'bg-blue-600 shadow-lg scale-105' 
                  : 'hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-wider leading-none">{item.label}</p>
                <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">{item.description}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10 flex-shrink-0">
           <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-4 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-black">AD</div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-tight">Administrador IT</p>
                 <p className="text-[9px] text-blue-400 font-bold uppercase italic">Nivel de Acceso 10</p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT: Light Theme */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Header (Fixed height, no scroll) */}
        <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-20">
          <div className="flex items-center space-x-4">
             <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Módulo:</span>
                <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">{menuItems.find(m => m.id === activeModule)?.label}</span>
             </div>
             
             <div className="h-6 w-px bg-slate-200"></div>

             <div className="flex items-center bg-slate-100 rounded-lg p-1">
                {(['ALL', 'VE', 'PE', 'RD'] as const).map(country => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                      selectedCountry === country 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {country}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="relative cursor-pointer hover:scale-110 transition-transform">
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">3</span>
                <span className="text-xl">🔔</span>
             </div>
             <button 
               onClick={onLogout}
               className="bg-slate-900 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
             >
               Cerrar Sesión
             </button>
          </div>
        </header>

        {/* Content Area (Scrollable) */}
        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          {activeModule === 'dashboard' && (
            <div className="space-y-10 max-w-7xl mx-auto">
               {/* Metrics Row */}
               <div className="grid grid-cols-4 gap-8">
                  {[
                    { label: 'Técnicos Totales', value: '1,250', delta: '+12%', color: 'border-blue-500' },
                    { label: 'Cuadrillas Vivas', value: '84', delta: 'PE/VE/RD', color: 'border-green-500' },
                    { label: 'QRs Generados (Hoy)', value: '3,412', delta: '+450 i/m', color: 'border-amber-500' },
                    { label: 'Alertas Críticas', value: '12', delta: 'Bandeja Roja', color: 'border-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color} hover:translate-y-[-4px] transition-transform cursor-pointer`}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                       <div className="flex items-end justify-between">
                          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.label.includes('Alertas') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             {stat.delta}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Real-time Monitoring Simulation */}
               <div className="grid grid-cols-3 gap-8 pb-10">
                  <div className="col-span-2 bg-white rounded-3xl shadow-sm p-10 border border-slate-100">
                     <div className="flex justify-between items-center mb-10">
                        <div className="space-y-1">
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Auditoría de Validación en Vivo</h3>
                           <p className="text-xs text-slate-400">Historial global de escaneos autenticados por TrustLayer</p>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Ver Todo</button>
                     </div>
                     <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                             <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-800 uppercase">Técnico V-3450 (Venezuela)</p>
                                   <p className="text-[9px] text-slate-400 uppercase tracking-widest">Validado en Sector {i % 2 === 0 ? 'Chacao' : 'Altamira'} • 10:45 AM</p>
                                </div>
                             </div>
                             <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-blue-600 shadow-sm border border-slate-200">JWT OK</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">🎓</div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4">TrustLayer Academic</h3>
                      <p className="text-xs opacity-50 mb-8 leading-relaxed">Resumen de cumplimiento normativo y certificaciones técnicas globales.</p>
                      
                      <div className="space-y-6">
                          {[
                            { label: 'Certificados', val: 78, color: 'bg-green-500' },
                            { label: 'Por Certificar', val: 15, color: 'bg-amber-500' },
                            { label: 'No Cursados', val: 7, color: 'bg-red-500' }
                          ].map(item => (
                            <div key={item.label} className="space-y-2">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                  <span>{item.label}</span>
                                  <span>{item.val}%</span>
                              </div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }}></div>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                          Gestionar Académico
                      </button>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Estado de Red SSE</h4>
                       <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          <p className="text-xs font-bold uppercase tracking-widest">Operativo • Real-Time</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeModule !== 'dashboard' && (
            <div className="h-full flex items-center justify-center">
              <div className="bg-white rounded-3xl shadow-sm p-24 text-center border border-slate-100 animate-in fade-in zoom-in max-w-2xl">
                <span className="text-6xl mb-6 block">🚧</span>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Módulo en Construcción</h3>
                <p className="text-slate-400 mb-10">La sección <b>{menuItems.find(m => m.id === activeModule)?.label}</b> está siendo optimizada por el equipo de IT para el despliegue del MVP Fibex.</p>
                <button 
                  onClick={() => setActiveModule('dashboard')}
                  className="px-10 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Volver al Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer (Fixed) */}
        <footer className="h-12 flex-shrink-0 px-10 bg-white border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] z-20">
           <span>Fibex Telecom • Governance Console v2.8</span>
           <span>Huso Horario Global: {selectedCountry === 'PE' ? 'PET (UTC-5)' : 'AST (UTC-4)'}</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminPanel;
