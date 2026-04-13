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
  const [newDeptName, setNewDeptName] = useState('');
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
        console.error('Error loading global data:', err);
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
      console.error(`Error loading module ${activeModule}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Operational Dashboard', icon: '📊', description: 'Tri-Country Summary' },
    { id: 'companies', label: 'Corporate Management', icon: '🏢', description: 'Partners & Affiliates' },
    { id: 'departments', label: 'Departments', icon: '🏢', description: 'Organizational Units' },
    { id: 'personnel', label: 'Personnel Management', icon: '👥', description: 'Staff Records' },
    { id: 'certifications', label: 'Academic History', icon: '🎓', description: 'Technical Levels' },
    { id: 'operations', label: 'Squads & Field', icon: '🚙', description: 'Logistic Deployment' },
    { id: 'qr-security', label: 'Security Center', icon: '🛡️', description: 'Protocol Control' },
    { id: 'alerts', label: 'Alerts & Reports', icon: '🚨', description: 'Incident History' },
    { id: 'countries', label: 'Global Expansion', icon: '🌍', description: 'Nations Management' },
    { id: 'config', label: 'Configuration', icon: '⚙️', description: 'Access & Permissions' },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <aside className="w-80 bg-[#001F3D] text-white flex flex-col shadow-2xl z-30 h-full">
        <div className="p-8 border-b border-white/10 flex flex-col items-center flex-shrink-0">
          <img src="/logo.webp" alt="Fibex" className="h-16 w-auto mb-4" />
          <div className="text-center">
             <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Fibex <span className="text-blue-400">Qr Professionals</span></h1>
             <p className="text-[9px] font-bold opacity-40 uppercase tracking-[0.3em] mt-1">Central Control Console</p>
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
                 <p className="text-[10px] font-black uppercase tracking-tight">IT Administrator</p>
                 <p className="text-[9px] text-blue-400 font-bold uppercase italic">Security Level 10</p>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col h-full overflow-hidden">
        <header className="h-20 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-20">
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-3">
                <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">MODULE:</span>
                   <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">{menuItems.find(m => m.id === activeModule)?.label}</span>
                </div>
             </div>
             
             {user.countryScope ? (
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100">
                   <span className="text-sm">{user.countryScope === 'VE' ? '🇻🇪' : user.countryScope === 'PE' ? '🇵🇪' : '🇩🇴'}</span>
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Country: {countries.find(p => p.code === user.countryScope)?.name || user.countryScope}</span>
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
               Sign Out
             </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          {activeModule === 'dashboard' && (
            <div className="space-y-10 max-w-7xl mx-auto">
               <div className="grid grid-cols-4 gap-8">
                  {[
                    { label: 'Total Technicians', value: dashboardStats.technicians.toLocaleString(), delta: 'VERIFIED BASE', color: 'border-blue-500' },
                    { label: 'Active Squads', value: dashboardStats.squads.toString(), delta: 'OPERATIONAL', color: 'border-green-500' },
                    { label: 'Active Validations', value: dashboardStats.activeQrs.toLocaleString(), delta: 'PROTOCOL', color: 'border-amber-500' },
                    { label: 'Critical Alerts', value: dashboardStats.alerts.toString(), delta: 'ATTENTION', color: 'border-red-500' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color} hover:translate-y-[-4px] transition-all cursor-pointer`}>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                       <div className="flex items-end justify-between">
                          <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</h3>
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.label.includes('Alerts') && dashboardStats.alerts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
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
                           <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Live Verification Audit</h3>
                           <p className="text-xs text-slate-400">Global history of scans authorized by Fibex Protocol</p>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Download Report</button>
                     </div>
                     <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                          const countries = ['VE', 'PE', 'RD'];
                          const currentTechCountry = countries[i % 3];
                          if (selectedCountry !== 'ALL' && selectedCountry !== currentTechCountry) return null;
                          return (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                               <div className="flex items-center space-x-4">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <div>
                                     <p className="text-[11px] font-black text-slate-800 uppercase">Technician ID-{3450 + i} ({currentTechCountry === 'VE' ? '🇻🇪 ' : currentTechCountry === 'PE' ? '🇵🇪 ' : '🇩🇴 '}{currentTechCountry})</p>
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest">Residential Sector Validation • {10 + i}:45 AM</p>
                                  </div>
                               </div>
                               <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full text-blue-600 shadow-sm border border-slate-200 uppercase">Valid Access</span>
                            </div>
                          );
                        })}
                     </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl shadow-2xl p-4 text-white relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">🎓</div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Personnel Certifications</h3>
                      <p className="text-xs opacity-50 mb-8 leading-relaxed">Summary of regulatory compliance and global technical training.</p>
                      <div className="space-y-6">
                          {[
                            { label: 'Status: Certified', val: 78, color: 'bg-green-500' },
                            { label: 'In Progress', val: 15, color: 'bg-amber-500' },
                            { label: 'Unchecked', val: 7, color: 'bg-red-500' }
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
                          Manage Certifications
                      </button>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Live Synchronization</h4>
                       <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                          <p className="text-xs font-bold uppercase tracking-widest">System Online • Operational</p>
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
                     <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Personnel Management</h2>
                     <p className="text-xs text-slate-400">Identity control, roles, and high-resolution official photos.</p>
                  </div>
                  <div className="flex space-x-3">
                      <label className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-sm active:scale-95">
                         <span className="text-sm">📥</span>
                         <span className="text-[10px] font-black uppercase tracking-wider">Import Records</span>
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
                                  setNotification({ type: 'error', message: err.message || 'Error processing file' });
                               } finally {
                                  setLoading(false);
                               }
                           }}
                         />
                      </label>
                     <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all">Export Report</button>
                  </div>
               </div>

               <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Staff Member</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Document ID</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Entity / Type</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Operative Zone</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {technicians.length > 0 ? technicians.map(tech => (
                           <tr key={tech.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative group-hover:shadow-md transition-all">
                                       <img src={tech.photoUrl || `https:
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                          <span className="text-xs">📸</span>
                                       </div>
                                    </div>
                                    <div>
                                       <p className="text-[12px] font-black text-slate-800 uppercase whitespace-nowrap">{tech.name}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                          {tech.role || 'Specialist'} • {tech.department?.name || 'General'}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-[11px] font-bold text-slate-500 font-mono tracking-tighter">{tech.documentId}</td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-700 uppercase">{tech.staffType === 'corporativo' ? 'FIBEX GLOBAL' : 'THIRD PARTY ALLY'}</span>
                                    <span className={`text-[8px] font-black w-fit px-2 py-0.5 rounded-full mt-1 ${tech.country === 'VE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                       {tech.country}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-tighter">{tech.zone || 'National'}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Sector</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${tech.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase">{tech.status}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center space-x-4">
                                    <label className="bg-slate-100 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm">
                                       Refresh Photo
                                       <input 
                                          type="file" 
                                          className="hidden" 
