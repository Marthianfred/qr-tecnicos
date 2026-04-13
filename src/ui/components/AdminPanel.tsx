import React, { useState, useEffect } from 'react';
import { apiService, Technician, Squad } from '../services/api';

type AdminModule = 
  | 'dashboard' 
  | 'companies' 
  | 'departamentos'
  | 'personnel' 
  | 'certifications' 
  | 'operations' 
  | 'qr-security' 
  | 'alerts' 
  | 'countries'
  | 'config';

interface AdminPanelProps {
  onLogout?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [selectedCountry, setSelectedCountry] = useState<'TODOS' | 'VE' | 'PE' | 'RD'>(user.countryScope || 'TODOS');
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [departamentos, setDepartments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ technicians: 0, activeQrs: 0, alerts: 0, recentReports: [] as any[], squads: 0 });
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    // Si el usuario tiene scope, forzamos el país
    if (user.countryScope && selectedCountry !== user.countryScope) {
       setSelectedCountry(user.countryScope);
    }
  }, [user.countryScope]);

  // Carga de datos globales una sola vez al montar el componente
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const countriesData = await apiService.getCountries();
        setCountries(countriesData);
      } catch (err) {
        console.error('Error al cargar datos globales:', err);
      }
    };
    loadGlobalData();
  }, []);

  useEffect(() => {
    fetchModuleData();
  }, [activeModule, selectedCountry]);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      
      // Ejecutamos solo la petición necesaria para el módulo actual
      switch (activeModule) {
        case 'dashboard':
          const stats = await apiService.getDashboardStats();
          setDashboardStats(stats);
          break;
        case 'personnel':
          const techs = await apiService.getTechnicians();
          const filteredTechs = selectedCountry === 'TODOS' ? techs : techs.filter(t => t.country === selectedCountry);
          setTechnicians(filteredTechs);
          break;
        case 'companies':
          const companiesData = await apiService.getCompanies();
          const filteredCompanies = selectedCountry === 'TODOS' ? companiesData : companiesData.filter(c => c.country === selectedCountry);
          setCompanies(filteredCompanies);
          break;
        case 'operations':
          const squadsData = await apiService.getSquads();
          const filteredSquads = selectedCountry === 'TODOS' ? squadsData : squadsData.filter(s => s.name.includes(selectedCountry));
          setSquads(filteredSquads);
          break;
        case 'departamentos':
          const depts = await apiService.getDepartments();
          setDepartments(depts);
          break;
        case 'countries':
          const freshCountries = await apiService.getCountries();
          setCountries(freshCountries);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error cargando módulo ${activeModule}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Sidebar Menu Definition
  const menuItems = [
    { id: 'dashboard', label: 'Panel Operativo', icon: '📊', description: 'Resumen Tres Países' },
    { id: 'companies', label: 'Gestión Corporativa', icon: '🏢', description: 'Companys y Aliados' },
    { id: 'departamentos', label: 'Departments', icon: '🏢', description: 'Áreas Operativas' },
    { id: 'personnel', label: 'Gestión de Personal', icon: '👥', description: 'Recursos Humanos' },
    { id: 'certifications', label: 'Historial Académico', icon: '🎓', description: 'Niveles Técnicos' },
    { id: 'operations', label: 'Squads y Campo', icon: '🚙', description: 'Despliegue Logístico' },
    { id: 'qr-security', label: 'Centro de Seguridad', icon: '🛡️', description: 'Control de Protocolos' },
    { id: 'alerts', label: 'Alertas y Reportes', icon: '🚨', description: 'Historial de Incidentes' },
    { id: 'countries', label: 'Expansión Global', icon: '🌍', description: 'Gestión de Naciones' },
    { id: 'config', label: 'Configuración', icon: '⚙️', description: 'Accesos y Permisos' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR: Corporate Deep Blue */}
      <aside className="w-80 bg-[#001F3D] text-white flex flex-col shadow-2xl z-30 h-full">
        <div className="p-8 border-b border-white/10 flex flex-col items-center flex-shrink-0">
          <img src="/logo.webp" alt="Fibex" className="h-16 w-auto mb-4" />
          <div className="text-center">
             <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Fibex <span className="text-blue-400">Qr Técnicos</span></h1>
             <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em] mt-1">Consola de Control Central</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center p-4 rounded-xl transition-all duration-300 group relative ${
                activeModule === item.id 
                  ? 'bg-blue-600 shadow-lg border border-white/20' 
                  : 'hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-wider leading-none">{item.label}</p>
                <p className="text-[9px] opacity-40 uppercase tracking-tighter mt-1">{item.description}</p>
              </div>
              {activeModule === item.id && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10 flex-shrink-0">
           <div className="bg-white/5 rounded-2xl p-4 flex items-center space-x-4 border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-black">AD</div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-tight">Administrador IT</p>
                 <p className="text-[9px] text-blue-400 font-bold uppercase italic">Nivel de Seguridad 10</p>
              </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT: Light Theme */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Header (Fixed height, no scroll) */}
        <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-20">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-3">
                <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">MÓDULO:</span>
                   <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">{menuItems.find(m => m.id === activeModule)?.label}</span>
                </div>
             </div>
             
                         {user.countryScope ? (
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100">
                   <span className="text-sm">{user.countryScope === 'VE' ? '🇻🇪' : user.countryScope === 'PE' ? '🇵🇪' : '🇩🇴'}</span>
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">País: {countries.find(p => p.codigo === user.countryScope)?.name || user.countryScope}</span>
                </div>
              ) : (
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                   <button
                     onClick={() => setSelectedCountry('TODOS')}
                     className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                       selectedCountry === 'TODOS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                     }`}
                   >
                     🌎
                   </button>
                   {countries.map(p => (
                     <button
                       key={p.codigo}
                       onClick={() => setSelectedCountry(p.codigo)}
                       className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                         selectedCountry === p.codigo 
                           ? 'bg-white text-blue-600 shadow-sm' 
                           : 'text-slate-400 hover:text-slate-600'
                       }`}
                     >
                       {p.bandera}
                     </button>
                   ))}
                </div>
              )}
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
                    { label: 'Técnicos Totales', value: dashboardStats.technicians.toLocaleString(), delta: 'BASE REAL', color: 'border-blue-500' },
                    { label: 'Squads Vivas', value: dashboardStats.squads.toString(), delta: 'OPERATIVO', color: 'border-green-500' },
                    { label: 'Validaciones Activas', value: dashboardStats.activeQrs.toLocaleString(), delta: 'PROTOCOLO', color: 'border-amber-500' },
                    { label: 'Alertas Críticas', value: dashboardStats.alerts.toString(), delta: 'ATENCIÓN', color: 'border-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color} hover:translate-y-[-4px] transition-all cursor-pointer`}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                       <div className="flex items-end justify-between">
                          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.label.includes('Alertas') && dashboardStats.alerts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
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
                           <p className="text-xs text-slate-400">Historial global de escaneos autorizados por el Protocolo Fibex</p>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Descargar Reporte</button>
                     </div>
                     <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                          const countries = ['VE', 'PE', 'RD'];
                          const currentTechCountry = countries[i % 3];
                          
                          // Filter logic simulation
                          if (selectedCountry !== 'TODOS' && selectedCountry !== currentTechCountry) return null;

                          return (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                               <div className="flex items-center space-x-4">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <div>
                                     <p className="text-[11px] font-black text-slate-800 uppercase">Técnico V-{3450 + i} ({currentTechCountry === 'VE' ? '🇻🇪 ' : currentTechCountry === 'PE' ? '🇵🇪 ' : '🇩🇴 '}{currentTechCountry})</p>
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest">Validación en Sector Residencial • {10 + i}:45 AM</p>
                                  </div>
                               </div>
                               <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-blue-600 shadow-sm border border-slate-200 uppercase">Acceso Válido</span>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl shadow-2xl p-4 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">🎓</div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Certificationes de Personal</h3>
                      <p className="text-xs opacity-50 mb-8 leading-relaxed">Resumen de cumplimiento normativo y certificaciones técnicas globales.</p>
                      
                      <div className="space-y-6">
                          {[
                            { label: 'Estatus: Certificado', val: 78, color: 'bg-green-500' },
                            { label: 'En Proceso', val: 15, color: 'bg-amber-500' },
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
                          Gestionar Certificationes
                      </button>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Sincronización en Vivo</h4>
                       <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          <p className="text-xs font-bold uppercase tracking-widest">Sistema en Línea • Operativo</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeModule === 'personnel' && (
            <div className="max-w-7xl mx-auto space-y-6">
               <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="space-y-1">
                     <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Gestión de Perfiles Técnicos</h2>
                     <p className="text-xs text-slate-400">Control de identidad, cargos y fotos oficiales de alta resolución.</p>
                  </div>
                  <div className="flex space-x-3">
                      <label className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-sm active:scale-95">
                         <span className="text-sm">📥</span>
                         <span className="text-[10px] font-black uppercase tracking-wider">Cargar Excel</span>
                         <input 
                           type="file" 
                           className="hidden" 
                           accept=".csv,.xlsx"
                           onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setLoading(true);
                              try {
                                 const result = await apiService.previewExcel(file, selectedCountry);
                                 setPreviewData(result.preview);
                                 setPendingFile(file);
                                 e.target.value = '';
                              } catch (err: any) {
                                 setNotification({ type: 'error', message: err.message || 'Error en la lectura' });
                              } finally {
                                 setLoading(false);
                              }
                           }}
                         />
                      </label>
                     <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all">Exportar Reporte</button>
                  </div>
               </div>

               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Personal</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Documento</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Company / Tipo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Zona Ops</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Estatus</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Acciones</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {/* Simulación de datos cargados del backend */}
                        {technicians.length > 0 ? technicians.map(tech => (
                           <tr key={tech.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group-hover:shadow-md transition-all">
                                       <img src={tech.fotoUrl || `https://i.pravatar.cc/100?u=${tech.id}`} alt="Tech" className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                          <span className="text-xs">📸</span>
                                       </div>
                                    </div>
                                    <div>
                                       <p className="text-[12px] font-black text-slate-800 uppercase whitespace-nowrap">{tech.name}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                          {tech.role || 'Especialista'} • {tech.departamento?.name || 'General'}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-[11px] font-bold text-slate-500 font-mono tracking-tighter">{tech.documentId}</td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{tech.staffType === 'corporativo' ? 'FIBEX GLOBAL' : 'ALIADO TERCERO'}</span>
                                    <span className={`text-[8px] font-black w-fit px-2 py-0.5 rounded-full mt-1 ${tech.country === 'VE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                       {tech.country}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tighter">{tech.zona || 'Nacional'}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sector Activado</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${tech.status === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{tech.status}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-4">
                                    <label className="bg-slate-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm">
                                       Actualizar Foto
                                       <input 
                                          type="file" 
                                          className="hidden" 
                                          accept="image/*"
                                          onChange={async (e) => {
                                             const file = e.target.files?.[0];
                                             if (!file) return;
                                             try {
                                                setLoading(true);
                                                await apiService.uploadPhoto(tech.id, file);
                                                setNotification({ type: 'success', message: 'Imagen guardada en almacenamiento persistente' });
                                                fetchModuleData();
                                             } catch (err) {
                                                setNotification({ type: 'error', message: 'Error al subir la foto oficial' });
                                             } finally {
                                                setLoading(false);
                                             }
                                          }} 
                                       />
                                    </label>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={5} className="px-8 py-20 text-center">
                                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No se encontraron registros en el sector {selectedCountry}</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
                  {loading && (
                    <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Cargando registros adicionales de la base de datos nacional...</p>
                    </div>
                  )}
               </div>
            </div>
          )}
          {activeModule === 'companies' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
               <div className="grid grid-cols-3 gap-6">
                  {companies.slice(0, 3).map(emp => (
                    <div key={emp.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Company en {emp.country}</h4>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">{emp.name}</h3>
                       <div className="flex items-center space-x-6">
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase">Técnicos</p>
                             <p className="text-lg font-black text-slate-800">{emp.tecnicosCount || 0}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Listado de Companys Aliadas / Contratistas</h3>
                     <button className="bg-slate-900 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">Añadir Aliado</button>
                  </div>
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
                           <th className="px-8 py-4">Company</th>
                           <th className="px-8 py-4">Documento / RIF</th>
                           <th className="px-8 py-4">País</th>
                           <th className="px-8 py-4">Suscripción</th>
                           <th className="px-8 py-4">Contrato</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {companies.length > 0 ? companies.map(aliado => (
                          <tr key={aliado.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-4 font-black text-[11px] text-slate-800 uppercase">{aliado.name}</td>
                            <td className="px-8 py-4 font-mono text-[10px] text-slate-400">{aliado.rif || 'J-0000000-0'}</td>
                            <td className="px-8 py-4 text-[11px] font-bold text-slate-600">{aliado.country}</td>
                            <td className="px-8 py-4">
                               <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter">Activo</span>
                            </td>
                            <td className="px-8 py-4 text-[10px] font-black text-blue-600 underline cursor-pointer italic">Ver PDF</td>
                          </tr>
                        )) : (
                           <tr>
                              <td colSpan={5} className="px-8 py-20 text-center opacity-30 italic uppercase text-[10px] font-black tracking-widest">No hay aliados comerciales registrados en esta región</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
          {activeModule === 'departamentos' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Estructura Organizativa</h2>
                     <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Gestión de Departments y Áreas Operativas</p>
                  </div>
                  <button 
                     onClick={() => setShowDeptModal(true)}
                     className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-105 transition-all"
                  >
                     + Crear Nueva Área
                  </button>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-100">
                               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Department</th>
                               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Personal Asignado</th>
                               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Estatus</th>
                               <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {departamentos.length > 0 ? departamentos.map(dept => (
                              <tr key={dept.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center space-x-4">
                                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                                          {dept.name.substring(0,2)}
                                       </div>
                                       <div>
                                          <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{dept.name}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Fibex Operaciones</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{dept.tecnicos?.length || 0} Especialistas</span>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Activo</span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end space-x-3">
                                       <button 
                                          onClick={async () => {
                                             if (confirm(`¿Eliminar área ${dept.name}?`)) {
                                                try {
                                                   await apiService.deleteDepartment(dept.id);
                                                   fetchModuleData();
                                                } catch (e) { setNotification({ type: 'error', message: 'No se puede eliminar (existen técnicos asociados)' }); }
                                             }
                                          }}
                                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                       >
                                          🗑️
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={4} className="px-8 py-20 text-center opacity-30 italic uppercase text-[11px] font-black tracking-widest">No hay áreas configuradas</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeModule === 'alerts' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in zoom-in-95 duration-300">
               <div className="bg-red-600 rounded-3xl p-10 text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 text-white/10 text-9xl">🚨</div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Centro de Incidentes</h2>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Monitoreo de inconsistencias reportadas en campo.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
                    <p className="text-[10px] font-black uppercase mb-1">Alertas Activas</p>
                    <p className="text-4xl font-black">{dashboardStats.alerts}</p>
                  </div>
               </div>

               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="space-y-1 p-4 border-b border-slate-50">
                     {dashboardStats.recentReports.length > 0 ? dashboardStats.recentReports.map((report: any) => (
                       <div key={report.id} className="flex items-center space-x-6 p-6 hover:bg-red-50/30 transition-all rounded-2xl group border border-transparent hover:border-red-100">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${!report.resolved ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                             {!report.resolved ? '⚠️' : '✅'}
                          </div>
                          <div className="flex-grow">
                             <div className="flex items-center space-x-3 mb-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter ${!report.resolved ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                   {!report.resolved ? 'URGENTE' : 'RESUELTO'}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INC-{report.id.substring(0,6)}</span>
                                <span className="text-[10px] text-slate-300 font-bold">• {new Date(report.reportedAt).toLocaleDateString()}</span>
                             </div>
                             <h4 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">{report.description}</h4>
                             <p className="text-[11px] text-slate-400 font-medium">Técnico involucrado: {report.tecnico?.name || 'Desconocido'}</p>
                          </div>
                          {!report.resolved && (
                             <button 
                                onClick={async () => {
                                   try {
                                      await apiService.resolveReport(report.id);
                                      fetchModuleData();
                                   } catch (e) { setNotification({ type: 'error', message: 'Error al resolver' }); }
                                }}
                                className="px-6 py-3 bg-slate-900 group-hover:bg-red-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md"
                             >
                                Resolver
                             </button>
                          )}
                       </div>
                     )) : (
                        <div className="p-20 text-center opacity-30 italic uppercase text-[11px] font-black tracking-widest">Sin incidentes críticos reportados en este sector</div>
                     )}
                  </div>
               </div>
            </div>
          )}

          {activeModule === 'qr-security' && (
            <div className="max-w-4xl mx-auto space-y-10 py-10">
               <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic">Protocolo de Validación Fibex</h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo de Vida del QR (Validez)</label>
                        <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-black uppercase">
                           <option>15 Minutos</option>
                           <option>30 Minutos</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Módulo: Historial Académico */}
          {activeModule === 'certifications' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Ranking de Certificación Técnica</h2>
                     <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Niveles de Capacitación Fibex 2026</p>
                  </div>
               </div>

               <div className="grid grid-cols-4 gap-6">
                  {[
                    { lvl: 'PREMIUM', count: 120, color: 'bg-amber-400', icon: '💎' },
                    { lvl: 'INTEGRAL', count: 450, color: 'bg-blue-500', icon: '📖' },
                    { lvl: 'BÁSICO', count: 580, color: 'bg-slate-400', icon: '🛠️' },
                    { lvl: 'INICIAL', count: 100, color: 'bg-green-400', icon: '🌱' }
                  ].map(item => (
                    <div key={item.lvl} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                       <span className="text-4xl mb-3 block">{item.icon}</span>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.lvl}</h4>
                       <p className="text-2xl font-black text-slate-800">{item.count}</p>
                       <div className={`h-1 w-12 mx-auto mt-4 rounded-full ${item.color}`}></div>
                    </div>
                  ))}
               </div>

               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Próximas Recertificaciones</h3>
                  <div className="space-y-4">
                     {[1,2,3].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">⚠️</div>
                              <p className="text-[11px] font-black text-slate-800 uppercase">Técnico A-{120+i} (Cédula: 18.52{i}.332)</p>
                           </div>
                           <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic">Expira en 12 días</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {/* Módulo: Squads y Campo */}
          {activeModule === 'operations' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-right-10 duration-500">
               <div className="flex justify-between items-center bg-blue-600 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-white/5 text-9xl">🚙</div>
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black uppercase tracking-tighter">Despliegue Operativo</h2>
                     <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Control logístico nacional de Squads en Campo.</p>
                  </div>
                  <div className="flex space-x-4">
                     <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20 text-center">
                        <p className="text-[9px] font-black uppercase">En Ruta</p>
                        <p className="text-2xl font-black">{dashboardStats.squads}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-3 gap-6">
                  {squads.length > 0 ? squads.map(squad => (
                    <div key={squad.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:border-blue-200 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">🚙</div>
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Operativa</span>
                       </div>
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">{squad.name}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Sector: {squad.zona || 'Nacional'}</p>
                       <div className="flex -space-x-3 overflow-hidden">
                          {squad.tecnicos?.map((t: any) => (
                            <img key={t.id} className="inline-block h-8 w-8 rounded-full ring-4 ring-white" src={t.foto || `https://i.pravatar.cc/100?u=${t.id}`} alt="Staff" />
                          ))}
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 ring-4 ring-white text-[9px] font-black text-slate-400">+{(squad.tecnicos?.length || 0) > 3 ? (squad.tecnicos?.length || 0) - 3 : 0}</div>
                       </div>
                    </div>
                  )) : (
                     <div className="col-span-3 py-20 text-center opacity-30 italic uppercase text-[11px] font-black tracking-widest">Sin cuadrillas activas asignadas a este territorio</div>
                  )}
               </div>
            </div>
          )}

          {activeModule === 'countries' && (
            <div className="max-w-7xl mx-auto space-y-8">
               <div className="bg-[#001F3D] p-10 rounded-[2.5rem] relative overflow-hidden text-white shadow-2xl">
                  <div className="absolute right-0 bottom-0 text-white/5 text-9xl">🌎</div>
                  <div className="relative z-10 space-y-4">
                     <h2 className="text-4xl font-black uppercase tracking-tighter">Expansión Global Fibex</h2>
                     <p className="text-sm font-bold opacity-70 uppercase tracking-widest max-w-xl">
                        Centro de gobernanza para la activación de nuevas naciones y operaciones internacionales de la red Fibex.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* List of Countries */}
                  <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nación / País</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código ISO</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {countries.map(p => (
                                 <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                       <div className="flex items-center space-x-4">
                                          <span className="text-2xl">{p.bandera}</span>
                                          <span className="text-xs font-black text-slate-700 uppercase">{p.name}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-5">
                                       <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{p.codigo}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                       <span className={`text-[8px] font-black px-2 py-1 rounded-full ${p.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                          {p.active ? 'ACTIVO' : 'PAUSADO'}
                                       </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                       <div className="flex justify-end space-x-4">
                                           <button 
                                              onClick={async () => {
                                                 try {
                                                    setLoading(true);
                                                    await apiService.updateCountry(p.id, { active: !p.active });
                                                    fetchModuleData();
                                                 } catch (err) {
                                                    setNotification({ type: 'error', message: 'Error al actualizar estado' });
                                                 } finally {
                                                    setLoading(false);
                                                 }
                                              }}
                                              className={`text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-widest transition-all ${p.active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                           >
                                              {p.active ? 'Pausar' : 'Activar'}
                                           </button>
                                           <button 
                                              onClick={async () => {
                                                 const nuevoNombre = prompt('Nuevo nombre de la nación:', p.name);
                                                 if (nuevoNombre && nuevoNombre !== p.name) {
                                                    try {
                                                       setLoading(true);
                                                       await apiService.updateCountry(p.id, { name: nuevoNombre });
                                                       fetchModuleData();
                                                    } catch (err) {
                                                       setNotification({ type: 'error', message: 'Error al editar nombre' });
                                                    } finally {
                                                       setLoading(false);
                                                    }
                                                 }
                                              }}
                                              className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                                           >
                                              Editar
                                           </button>
                                        </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Add New Country Form */}
                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-6">Activar Nuevo País</h3>
                        <form className="space-y-4" onSubmit={async (e) => {
                           e.preventDefault();
                           const formData = new FormData(e.currentTarget);
                           const newCountry = {
                              name: formData.get('nombre') as string,
                              codigo: formData.get('codigo') as string,
                              bandera: formData.get('bandera') as string,
                              active: true
                           };
                           try {
                              setLoading(true);
                              await apiService.createCountry(newCountry);
                              setNotification({ type: 'success', message: 'Nuevo país internacional activado con éxito' });
                              fetchModuleData();
                              (e.target as HTMLFormElement).reset();
                           } catch (err) {
                              setNotification({ type: 'error', message: 'Error al registrar país' });
                           } finally {
                              setLoading(false);
                           }
                        }}>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nombre del País</label>
                              <input 
                                 name="nombre" 
                                 required 
                                 placeholder="Ej: Panamá, Colombia..."
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Código ISO (2 Chars)</label>
                              <input 
                                 name="codigo" 
                                 required 
                                 maxLength={2}
                                 placeholder="Ej: PA, CO..."
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bandera (Emoji)</label>
                              <input 
                                 name="bandera" 
                                 required 
                                 placeholder="Copia el emoji de la bandera..."
                                 className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                              />
                           </div>
                           <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 mt-4">
                              Confirmar Activación
                           </button>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeModule !== 'dashboard' && activeModule !== 'personnel' && activeModule !== 'companies' && activeModule !== 'departamentos' && activeModule !== 'alerts' && activeModule !== 'qr-security' && activeModule !== 'certifications' && activeModule !== 'operations' && activeModule !== 'countries' && (
            <div className="h-full flex items-center justify-center">
               <div className="bg-white rounded-3xl shadow-sm p-24 text-center border border-slate-100 animate-in fade-in zoom-in max-w-2xl">
                <span className="text-6xl mb-6 block">🚧</span>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Módulo en Construcción</h3>
                <p className="text-slate-400 mb-10">La sección <b>{menuItems.find(m => m.id === activeModule)?.label}</b> está siendo optimizada por el equipo de IT para el despliegue del MVP Fibex.</p>
                <button 
                  onClick={() => setActiveModule('dashboard')}
                  className="px-10 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Volver al Panel de Control
                </button>
              </div>
            </div>
          )}
        </div>
        
        <footer className="h-12 flex-shrink-0 px-10 bg-white border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] z-20">
           <span>Fibex Telecom • Consola de Control Central v2.8</span>
           <span>Huso Horario Global: {selectedCountry === 'PE' ? 'PET (UTC-5)' : 'AST (UTC-4)'}</span>
        </footer>

        {/* Modal de Previsualización de Datos */}
        {previewData && (
           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-100">
                 <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                    <div className="space-y-1">
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Previsualización de Ingesta</h3>
                       <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest italic">Ámbito de Destino: {selectedCountry === 'TODOS' ? 'NACIONAL (GLOBAL)' : `${countries.find(p => p.codigo === selectedCountry)?.name || selectedCountry}`}</p>
                    </div>
                    <div className="bg-blue-600 px-6 py-2 rounded-xl">
                       <span className="text-xl font-black">{previewData.length}</span>
                       <span className="text-[9px] font-black uppercase ml-2 opacity-70">Detectados</span>
                    </div>
                 </div>
                 
                 <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Técnico</th>
                             <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                             <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                             <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Región</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {previewData.map((row, i) => (
                             <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-4 text-xs font-black text-slate-800 uppercase">{row.name}</td>
                                <td className="py-4 text-xs font-mono font-bold text-slate-400">{row.documentId}</td>
                                <td className="py-4 text-[10px] font-black text-blue-600 uppercase italic">{row.role}</td>
                                <td className="py-4 text-[10px] font-black text-slate-400 text-right uppercase tracking-widest">{row.country}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end space-x-4">
                    <button 
                       onClick={() => { setPreviewData(null); setPendingFile(null); }}
                       className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={async () => {
                          if (!pendingFile) return;
                          try {
                             setLoading(true);
                             await apiService.uploadExcel(pendingFile, selectedCountry);
                             setNotification({ type: 'success', message: 'Ingesta Masiva Completada con Éxito' });
                             setPreviewData(null);
                             setPendingFile(null);
                             fetchModuleData();
                          } catch (err: any) {
                             setNotification({ type: 'error', message: `Error Crítico: ${err.message}` });
                          } finally {
                             setLoading(false);
                          }
                       }}
                       className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95"
                    >
                       Confirmar y Cargar a Base de Datos
                    </button>
                 </div>
              </div>
           </div>
        )}

         {/* Modal Premium para Departments */}
         {showDeptModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
               <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-white/20">
                  <div className="text-center space-y-2">
                     <span className="text-4xl">🏢</span>
                     <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Nueva Área Fibex</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define el nombre del nuevo departamento operativo</p>
                  </div>

                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nombre Oficial</label>
                        <input 
                           value={newDeptName}
                           onChange={(e) => setNewDeptName(e.target.value)}
                           onKeyPress={async (e) => {
                             if (e.key === 'Enter' && newDeptName) {
                               try {
                                 setLoading(true);
                                 await apiService.createDepartment({ name: newDeptName });
                                 setShowDeptModal(false);
                                 setNewDeptName('');
                                 fetchModuleData();
                               } catch (e) {
                                 setNotification({ type: 'error', message: 'Error al registrar departamento' });
                               } finally {
                                 setLoading(false);
                               }
                             }
                           }}
                           placeholder="Ej: CDR, O&M, Mantenimiento..."
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                           autoFocus
                        />
                     </div>
                  </div>

                  <div className="flex flex-col space-y-3 pt-4">
                     <button 
                        onClick={async () => {
                           if (!newDeptName) return;
                           try {
                              setLoading(true);
                              await apiService.createDepartment({ name: newDeptName });
                              setShowDeptModal(false);
                              setNewDeptName('');
                              fetchModuleData();
                           } catch (e) {
                                 setNotification({ type: 'error', message: 'Error al registrar departamento' });
                           } finally {
                              setLoading(false);
                           }
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                     >
                        Confirmar Registro
                     </button>
                     <button 
                        onClick={() => { setShowDeptModal(false); setNewDeptName(''); }}
                        className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 hover:text-slate-600 transition-all"
                     >
                        Cancelar
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Sistema de Notificaciones Premium */}
         {notification && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 fade-in duration-300">
               <div className={`
                  flex items-center space-x-4 px-8 py-5 rounded-3xl shadow-2xl backdrop-blur-xl border
                  ${notification.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' : ''}
                  ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : ''}
                  ${notification.type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' : ''}
               `}>
                  <span className="text-xl">
                     {notification.type === 'success' && '✅'}
                     {notification.type === 'error' && '❌'}
                     {notification.type === 'warning' && '⚠️'}
                  </span>
                  <div className="flex flex-col">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 m-0 leading-none mb-1">Notificación de Sistema</p>
                     <p className="text-xs font-black uppercase tracking-tight m-0">{notification.message}</p>
                  </div>
                  <button 
                     onClick={() => setNotification(null)}
                     className="ml-4 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-xs transition-all"
                  >
                     ✕
                  </button>
               </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default AdminPanel;
