import React, { useState, useEffect } from 'react';
import { apiService, Technician, Squad } from '../services/api';

type AdminModule = 
  | 'dashboard' 
  | 'companies' 
  | 'departments'
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
  const [selectedCountry, setSelectedCountry] = useState<'ALL' | 'VE' | 'PE' | 'RD'>(user.countryScope || 'ALL');
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ technicians: 0, activeQrs: 0, alerts: 0, recentReports: [] as any[], squads: 0 });
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newCompany, setNewCompany] = useState({ name: '', country: 'VE' });
  const [newCountry, setNewCountry] = useState({ name: '', code: '', flag: '🚩' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (user.countryScope && selectedCountry !== user.countryScope) {
       setSelectedCountry(user.countryScope);
    }
  }, [user.countryScope]);

  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const countriesData = await apiService.getCountries();
        setCountries(countriesData);
      } catch (err) {
        console.error('Error cargando datos globales:', err);
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
      switch (activeModule) {
        case 'dashboard':
          const stats = await apiService.getDashboardStats();
          setDashboardStats(stats);
          break;
        case 'personnel':
          const techs = await apiService.getTechnicians();
          const filteredTechs = selectedCountry === 'ALL' ? techs : techs.filter(t => t.country === selectedCountry);
          setTechnicians(filteredTechs);
          break;
        case 'companies':
          const cos = await apiService.getCompanies();
          const filteredCompanies = selectedCountry === 'ALL' ? cos : cos.filter(c => c.country === selectedCountry);
          setCompanies(filteredCompanies);
          break;
        case 'operations':
          const squadsData = await apiService.getSquads();
          const filteredSquads = selectedCountry === 'ALL' ? squadsData : squadsData.filter(s => s.name.includes(selectedCountry) || s.zone?.includes(selectedCountry));
          setSquads(filteredSquads);
          break;
        case 'departments':
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

  const menuItems = [
    { id: 'dashboard', label: 'Tablero Operativo', icon: '📊', description: 'Resumen Tri-Nacional' },
    { id: 'companies', label: 'Gestión Corporativa', icon: '🏢', description: 'Aliados y Contratistas' },
    { id: 'departments', label: 'Departamentos', icon: '🏢', description: 'Unidades Organizativas' },
    { id: 'personnel', label: 'Gestión de Personal', icon: '👥', description: 'Expediente Técnico' },
    { id: 'certifications', label: 'Historial Académico', icon: '🎓', description: 'Niveles de Certificación' },
    { id: 'operations', label: 'Cuadrillas y Campo', icon: '🚙', description: 'Despliegue Logístico' },
    { id: 'qr-security', label: 'Centro de Seguridad', icon: '🛡️', description: 'Control de Protocolos' },
    { id: 'alerts', label: 'Alertas y Reportes', icon: '🚨', description: 'Historial de Incidentes' },
    { id: 'countries', label: 'Expansión Global', icon: '🌍', description: 'Gestión de Naciones' },
    { id: 'config', label: 'Configuración', icon: '⚙️', description: 'Accesos y Permisos' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <aside className="w-80 bg-[#001F3D] text-white flex flex-col shadow-2xl z-30 h-full">
        <div className="p-8 border-b border-white/10 flex flex-col items-center flex-shrink-0">
          <img src="/logo.webp" alt="Fibex" className="h-16 w-auto mb-4" />
          <div className="text-center">
             <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Fibex <span className="text-blue-400">Qr Professionals</span></h1>
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

      <main className="flex-grow main-layout flex flex-col h-full overflow-hidden">
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
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sede: {countries.find(p => p.code === user.countryScope)?.name || user.countryScope}</span>
                </div>
              ) : (
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                   <button
                     onClick={() => setSelectedCountry('ALL')}
                     className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                       selectedCountry === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                     }`}
                   >
                     🌎
                   </button>
                   {countries.map(p => (
                     <button
                       key={p.code}
                       onClick={() => setSelectedCountry(p.code)}
                       className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                         selectedCountry === p.code 
                           ? 'bg-white text-blue-600 shadow-sm' 
                           : 'text-slate-400 hover:text-slate-600'
                       }`}
                     >
                       {p.flag}
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

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          {activeModule === 'dashboard' && (
            <div className="space-y-10 max-w-7xl mx-auto">
               <div className="grid grid-cols-4 gap-8">
                  {[
                    { label: 'Total Técnicos', value: dashboardStats.technicians.toLocaleString(), delta: 'BASE VERIFICADA', color: 'border-blue-500' },
                    { label: 'Cuadrillas Activas', value: dashboardStats.squads.toString(), delta: 'OPERACIONAL', color: 'border-green-500' },
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

               <div className="grid grid-cols-3 gap-8 pb-10">
                  <div className="col-span-2 bg-white rounded-3xl shadow-sm p-10 border border-slate-100">
                     <div className="flex justify-between items-center mb-10">
                        <div className="space-y-1">
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Auditoría de Validación en Vivo</h3>
                           <p className="text-xs text-slate-400">Historial global de escaneos autorizados por Protocolo Fibex</p>
                        </div>
                        <button 
                          onClick={() => setNotification({ type: 'warning', message: 'Generando reporte de auditoría de red...' })}
                          className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                        >
                          Descargar Reporte
                        </button>
                     </div>
                     <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                          const countriesList = ['VE', 'PE', 'RD'];
                          const currentTechCountry = countriesList[i % 3];
                          if (selectedCountry !== 'ALL' && selectedCountry !== currentTechCountry) return null;
                          return (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                               <div className="flex items-center space-x-4">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <div>
                                     <p className="text-[11px] font-black text-slate-800 uppercase">Técnico ID-{3450 + i} ({currentTechCountry === 'VE' ? 'VENEZUELA 🇻🇪 ' : currentTechCountry === 'PE' ? 'PERÚ 🇵🇪 ' : 'REP. DOMINICANA 🇩🇴 '})</p>
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest">Validación Sector Residencial • {10 + i}:45 AM</p>
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
                       <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Certificaciones de Personal</h3>
                       <p className="text-xs opacity-50 mb-8 leading-relaxed">Resumen del cumplimiento normativo y capacitación técnica global.</p>
                       <div className="space-y-6">
                           {[
                             { label: 'Estatus: Certificado', val: 78, color: 'bg-green-500' },
                             { label: 'En Progreso', val: 15, color: 'bg-amber-500' },
                             { label: 'No Verificado', val: 7, color: 'bg-red-500' }
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
                       <button 
                         onClick={() => setNotification({ type: 'warning', message: 'Gestionando registros desde la matriz...' })}
                         className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                       >
                           Gestionar Certificaciones
                       </button>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Sincronización en Vivo</h4>
                       <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          <p className="text-xs font-bold uppercase tracking-widest">Sistema En Línea • Operativo</p>
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
                     <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Gestión de Personal</h2>
                     <p className="text-xs text-slate-400">Control de identidad, roles y fotos oficiales de alta resolución.</p>
                  </div>
                  <div className="flex space-x-3">
                      <label className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-sm active:scale-95">
                         <span className="text-sm">📥</span>
                         <span className="text-[10px] font-black uppercase tracking-wider">Importar Registros</span>
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
                                  setNotification({ type: 'error', message: err.message || 'Error procesando archivo' });
                               } finally {
                                  setLoading(false);
                               }
                           }}
                         />
                      </label>
                     <button 
                        onClick={() => setNotification({ type: 'warning', message: 'Compilando base de datos de personal...' })}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                      >
                        Exportar Reporte
                      </button>
                  </div>
               </div>

               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Miembro del Personal</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Cédula / ID</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Entidad / Tipo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Zona Operativa</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Estatus</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Acciones</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {technicians.length > 0 ? technicians.map(tech => (
                           <tr key={tech.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group-hover:shadow-md transition-all">
                                       <img src={tech.photoUrl || `https://i.pravatar.cc/300?u=${tech.documentId}`} alt="Tech" className="w-full h-full object-cover" />
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                          <span className="text-xs">📸</span>
                                       </div>
                                    </div>
                                    <div>
                                       <p className="text-[12px] font-black text-slate-800 uppercase whitespace-nowrap">{tech.name}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                          {tech.role || 'Especialista'} • {tech.department?.name || 'General'}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-[11px] font-bold text-slate-500 font-mono tracking-tighter">{tech.documentId}</td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{tech.staffType === 'CORPORATE' ? 'STAFF FIBEX' : 'ALIADO TERCERO'}</span>
                                    <span className={`text-[8px] font-black w-fit px-2 py-0.5 rounded-full mt-1 ${tech.country === 'VE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                       {tech.country}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tighter">{tech.zone || 'Nacional'}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sector Activo</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${tech.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{tech.status === 'active' ? 'ACTIVO' : 'INACTIVO'}</span>
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
                                                setNotification({ type: 'success', message: 'Foto oficial actualizada' });
                                                fetchModuleData();
                                             } catch (err) {
                                                setNotification({ type: 'error', message: 'Fallo al actualizar' });
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
                              <td colSpan={6} className="px-8 py-20 text-center">
                                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No se encontraron registros para el sector {selectedCountry}</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeModule === 'companies' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {companies.length > 0 ? companies.slice(0, 3).map(emp => (
                    <div key={emp.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative group overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                       <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Empresa en {emp.country}</h4>
                       <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-4">{emp.name}</h3>
                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contratista Activo</span>
                          <span className="text-blue-600 font-black text-xs">→</span>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-3 p-12 bg-white rounded-3xl border border-slate-100 border-dashed text-center">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No hay aliados comerciales registrados en esta región</p>
                    </div>
                  )}
               </div>
               
               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                     <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Aliados Globales y Contratistas</h3>
                     <button 
                        onClick={() => setShowCompanyModal(true)}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                      >
                        Nueva Empresa
                      </button>
                  </div>
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                           <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de Entidad</th>
                           <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Territorio</th>
                           <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Asignado</th>
                           <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estatus Auditoría</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {companies.map(emp => (
                           <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-10 py-5 font-black text-slate-800 uppercase tracking-tight text-xs">{emp.name}</td>
                              <td className="px-10 py-5">
                                 <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black border border-blue-100">{emp.country}</span>
                              </td>
                              <td className="px-10 py-5 text-xs font-bold text-slate-500">24 Técnicos</td>
                              <td className="px-10 py-5">
                                 <span className="text-[10px] font-black text-green-600 uppercase">Verificado</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeModule === 'departments' && (
            <div className="max-w-7xl mx-auto space-y-8">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Nodos Organizativos</h2>
                  <button 
                    onClick={() => setShowDeptModal(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                  >
                    Crear Departamento
                  </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {departments.map(dept => (
                    <div key={dept.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:shadow-xl transition-all group">
                       <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">🏢</span>
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">{dept.name}</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nodo Fibex 00{dept.id}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeModule === 'countries' && (
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
               <div className="bg-slate-900 rounded-[3rem] p-16 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                     <span className="text-[20rem] absolute -top-20 -right-20">🌍</span>
                  </div>
                  <div className="relative z-10 space-y-6">
                     <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Gestión de <span className="text-blue-500">Territorios</span></h2>
                     <p className="text-sm font-bold opacity-40 uppercase tracking-[0.4em]">Control Global de Operaciones Transnacionales Fibex</p>
                     <button 
                        onClick={() => setShowCountryModal(true)}
                        className="bg-white text-slate-900 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                      >
                        Añadir Nueva Región
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {countries.map(country => (
                    <div key={country.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 hover:shadow-2xl transition-all group">
                       <div className="flex justify-between items-start mb-8">
                          <span className="text-6xl filter grayscale group-hover:grayscale-0 transition-all">{country.flag}</span>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${country.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                             {country.active ? 'Operativo' : 'Mantenimiento'}
                          </span>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{country.name}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Protocolo de Región: {country.code}-FIB</p>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => setNotification({ type: 'warning', message: 'Abriendo parámetros de configuración...' })}
                             className="bg-slate-50 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-slate-100 transition-all"
                          >
                             Editar
                          </button>
                          <button 
                             onClick={() => setNotification({ type: 'warning', message: 'Compilando inteligencia geopolítica...' })}
                             className="bg-slate-50 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-blue-50 text-blue-600 transition-all"
                          >
                             Reportes
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeModule === 'operations' && (
            <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-right-10 duration-500">
               <div className="bg-blue-600 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 text-white/5 text-9xl">🚙</div>
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black uppercase tracking-tighter">Despliegue Operativo</h2>
                     <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Control logístico nacional de Cuadrillas en Campo.</p>
                  </div>
                  <div className="mt-8 flex space-x-4">
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
                          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Operativo</span>
                       </div>
                       <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">{squad.name}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Sector: {squad.zone || 'Nacional'}</p>
                       <div className="flex -space-x-3 overflow-hidden">
                          {squad.technicians?.map((t: any) => (
                            <img key={t.id} className="inline-block h-8 w-8 rounded-full ring-4 ring-white" src={t.photoUrl || `https://i.pravatar.cc/300?u=${t.documentId}`} alt="Personal" />
                          ))}
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 ring-4 ring-white text-[9px] font-black text-slate-400">+{(squad.technicians?.length || 0) > 3 ? (squad.technicians?.length || 0) - 3 : 0}</div>
                       </div>
                    </div>
                  )) : (
                     <div className="col-span-3 py-20 text-center opacity-30 italic uppercase text-[11px] font-black tracking-widest">No hay cuadrillas activas asignadas a este territorio</div>
                  )}
               </div>
            </div>
          )}
        </div>
        
        <footer className="h-12 flex-shrink-0 px-10 bg-white border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] z-20">
           <span>Fibex Telecom • Consola de Control Central v5.0 Master</span>
           <span>Zona Horaria Global: {selectedCountry === 'PE' ? 'PET (UTC-5)' : 'AST (UTC-4)'}</span>
        </footer>
      </main>

      {/* MODAL SISTEMA: CREACIÓN DE DEPARTAMENTO */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowDeptModal(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
              <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Nuevo Nodo Organizativo</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Definición de Departamento Fibex</p>
                 </div>
                 <button onClick={() => setShowDeptModal(false)} className="text-2xl opacity-30 hover:opacity-100 transition-opacity">✕</button>
              </header>
              
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del Departamento</label>
                    <input 
                       autoFocus
                       value={newDeptName}
                       onChange={(e) => setNewDeptName(e.target.value)}
                       placeholder="Ej: OPERACIONES RED" 
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                    />
                 </div>

                 <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center space-x-3 text-blue-700">
                       <span className="text-sm">ℹ️</span>
                       <p className="text-[9px] font-black uppercase tracking-widest">Esta unidad organizativa será visible para el despacho de cuadrillas de {selectedCountry === 'ALL' ? 'todas las zonas' : selectedCountry}.</p>
                    </div>
                 </div>

                 <div className="flex space-x-4 pt-4">
                    <button 
                       onClick={() => setShowDeptModal(false)}
                       className="flex-grow py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                       Cancelar
                    </button>
                    <button 
                       disabled={!newDeptName || loading}
                       onClick={async () => {
                          try {
                             setLoading(true);
                             await apiService.createDepartment({ name: newDeptName.toUpperCase() });
                             setNotification({ type: 'success', message: 'Departamento creado exitosamente' });
                             setShowDeptModal(false);
                             setNewDeptName('');
                             fetchModuleData();
                          } catch (err: any) {
                             setNotification({ type: 'error', message: err.message || 'Error al crear' });
                          } finally {
                             setLoading(false);
                          }
                       }}
                       className="flex-grow py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30"
                    >
                       {loading ? 'Procesando...' : 'Guardar Nodo'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL SISTEMA: CREACIÓN DE EMPRESA */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowCompanyModal(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
              <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Nuevo Aliado Comercial</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registro de Entidad Contratista</p>
                 </div>
                 <button onClick={() => setShowCompanyModal(false)} className="text-2xl opacity-30 hover:opacity-100 transition-opacity">✕</button>
              </header>
              <div className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre de Empresa</label>
                    <input 
                       autoFocus
                       value={newCompany.name}
                       onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">País de Operación</label>
                    <select 
                       value={newCompany.country}
                       onChange={(e) => setNewCompany({...newCompany, country: e.target.value})}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none appearance-none"
                    >
                       <option value="VE">Venezuela</option>
                       <option value="PE">Perú</option>
                       <option value="RD">Rep. Dominicana</option>
                    </select>
                 </div>
                 <div className="flex space-x-4 pt-6">
                    <button onClick={() => setShowCompanyModal(false)} className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                    <button 
                       disabled={!newCompany.name || loading}
                       onClick={async () => {
                          try {
                             setLoading(true);
                             await apiService.createCompany(newCompany);
                             setNotification({ type: 'success', message: 'Empresa registrada correctamente' });
                             setShowCompanyModal(false);
                             setNewCompany({ name: '', country: 'VE' });
                             fetchModuleData();
                          } catch (err: any) {
                             setNotification({ type: 'error', message: err.message || 'Error al registrar' });
                          } finally {
                             setLoading(false);
                          }
                       }}
                       className="flex-grow py-4 bg-slate-900 text-white rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-30"
                    >
                       Registrar Aliado
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL SISTEMA: CREACIÓN DE REGIÓN */}
      {showCountryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowCountryModal(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
              <header className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Aumentar Cobertura</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Expansión de Territorio Fibex</p>
                 </div>
                 <button onClick={() => setShowCountryModal(false)} className="text-2xl opacity-30 hover:opacity-100 transition-opacity">✕</button>
              </header>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre País</label>
                       <input value={newCountry.name} onChange={(e) => setNewCountry({...newCountry, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Código (ISO)</label>
                       <input maxLength={2} value={newCountry.code} onChange={(e) => setNewCountry({...newCountry, code: e.target.value.toUpperCase()})} placeholder="EJ: CO" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase focus:ring-2 focus:ring-blue-600 transition-all outline-none" />
                    </div>
                 </div>
                 <div className="flex space-x-4 pt-6">
                    <button onClick={() => setShowCountryModal(false)} className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                    <button 
                       disabled={!newCountry.name || !newCountry.code || loading}
                       onClick={async () => {
                          try {
                             setLoading(true);
                             await apiService.createCountry({...newCountry, active: true});
                             setNotification({ type: 'success', message: 'Nueva región activada' });
                             setShowCountryModal(false);
                             setNewCountry({ name: '', code: '', flag: '🚩' });
                             fetchModuleData();
                          } catch (err: any) {
                             setNotification({ type: 'error', message: err.message || 'Error al activar región' });
                          } finally {
                             setLoading(false);
                          }
                       }}
                       className="flex-grow py-4 bg-blue-600 text-white rounded-2xl shadow-xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-30"
                    >
                       Activar Región
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* NOTIFICACIONES DE SISTEMA */}
      {notification && (
        <div className={`fixed bottom-10 right-10 z-[110] px-8 py-4 rounded-2xl shadow-2xl border-l-[6px] animate-in slide-in-from-right-10 duration-500 ${
           notification.type === 'success' ? 'bg-white border-green-500 text-slate-900' : 'bg-white border-red-500 text-slate-900'
        }`}>
           <div className="flex items-center space-x-4">
              <span className="text-xl">{notification.type === 'success' ? '✅' : '❌'}</span>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{notification.type === 'success' ? 'Operación Exitosa' : 'Fallo de Sistema'}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{notification.message}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
