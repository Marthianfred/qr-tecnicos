import React, { useState, useEffect } from 'react';
import { apiService, Technician, Cuadrilla } from '../services/api';

interface CoordinatorMonitorProps {
  readonly children?: React.ReactNode;
}

/**
 * Pantalla 4.1: Monitor de Cuadrillas (Interfaz del Coordinador)
 */
export const CoordinatorMonitor: React.FC<CoordinatorMonitorProps> = () => {
  const [filterCountry, setFilterCountry] = useState('All');
  const [activeTab, setActiveTab] = useState<'tecnicos' | 'cuadrillas'>('tecnicos');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [techsData, reportsData, cuadrillasData] = await Promise.all([
        apiService.getTechnicians(),
        apiService.getReports(),
        apiService.getCuadrillas(),
      ]);
      setTechnicians(techsData);
      setReports(reportsData);
      setCuadrillas(cuadrillasData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching coordinator data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Suscripción Real-Time vía SSE
    const token = localStorage.getItem('token');
    const eventSource = new EventSource(`/api/tecnicos/events${token ? `?token=${token}` : ''}`);
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('Real-Time Event Received:', payload);
        
        if (payload.id && payload.reason) {
          setReports(prev => [payload, ...prev]);
        } else {
          fetchData();
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const filteredSquad = filterCountry === 'All' 
    ? technicians 
    : technicians.filter(tech => tech.pais === filterCountry);

  const suspendTech = async (id: string) => {
    try {
      await fetch(`/api/tecnicos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUSPENDIDO' }),
      });
      await fetchData();
    } catch (err) {
      console.error('Error suspending tech:', err);
    }
  };

  const dismissAlert = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  const assignToCuadrilla = async (tecnicoId: string, cuadrillaId: string) => {
    try {
      await apiService.assignTecnicosToCuadrilla(cuadrillaId, [tecnicoId]);
      await fetchData();
    } catch (err) {
      console.error('Error assigning tech:', err);
    }
  };

  const removeFromCuadrilla = async (cuadrillaId: string, tecnicoId: string) => {
    try {
      await apiService.removeTecnicoFromCuadrilla(cuadrillaId, tecnicoId);
      await fetchData();
    } catch (err) {
      console.error('Error removing tech:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface font-sans text-on_surface">
      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-grow">
        {/* Simple Sidebar */}
        <aside className="w-64 bg-surface_container_lowest shadow-ambient z-10 hidden md:block no-border">
          <div className="p-8 flex items-center space-x-3">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-display font-extrabold tracking-tight uppercase">Trust<span className="text-primary">Admin</span></h1>
          </div>
          <nav className="mt-8 space-y-1 px-4">
            <button 
              onClick={() => setActiveTab('tecnicos')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'tecnicos' ? 'trust-gradient text-white shadow-lg' : 'text-on_surface opacity-50 hover:opacity-100 hover:bg-surface_container_low'}`}
            >
              <span className="text-xs font-display font-extrabold uppercase tracking-widest">Monitor de Ops</span>
            </button>
            <button 
              onClick={() => setActiveTab('cuadrillas')}
              className={`w-full text-left flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'cuadrillas' ? 'trust-gradient text-white shadow-lg' : 'text-on_surface opacity-50 hover:opacity-100 hover:bg-surface_container_low'}`}
            >
              <span className="text-xs font-display font-extrabold uppercase tracking-widest">Control de Cuadrillas</span>
            </button>
            <div className="pt-8 pb-2 px-4">
              <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Guardian Suite</span>
            </div>
            <a href="#" className="flex items-center px-4 py-3 rounded-lg text-on_surface opacity-50 hover:opacity-100 hover:bg-surface_container_low transition-all">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest">Logs de Seguridad</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 rounded-lg text-on_surface opacity-50 hover:opacity-100 hover:bg-surface_container_low transition-all">
              <span className="text-xs font-display font-extrabold uppercase tracking-widest">Certificaciones</span>
            </a>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-grow flex flex-col bg-surface_container_low">
          {/* Top Bar */}
          <header className="bg-surface_container_lowest h-20 shadow-ambient flex items-center justify-between px-10 no-border relative z-20">
            <h2 className="text-2xl font-display font-extrabold text-on_surface tracking-tighter uppercase">
              {activeTab === 'tecnicos' ? 'Supervisión Operativa' : 'Gestión Estratégica de Cuadrillas'}
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative glassmorphism p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
                {reports.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[9px] font-display font-extrabold w-4 h-4 rounded-full flex items-center justify-center glow-pulse">
                    {reports.length}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-display font-extrabold text-on_surface tracking-tight uppercase">Comandante Principal</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Nivel 10</p>
                </div>
                <div className="w-10 h-10 rounded-full trust-gradient flex items-center justify-center text-white font-display font-extrabold shadow-lg">
                  RC
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 space-y-12 overflow-y-auto">
            {/* Alerts Section */}
            {reports.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xs font-display font-extrabold text-error uppercase tracking-[0.3em]">Violaciones Críticas de Protocolo</h3>
                  <div className="h-px bg-error/10 flex-grow"></div>
                </div>
                
                {reports.map(report => (
                  <div key={report.id} className="bg-surface_container_lowest p-6 rounded-lg shadow-ambient no-border flex flex-col md:flex-row justify-between items-center gap-6 animate-bounce-short">
                    <div className="flex items-center space-x-5">
                      <div className="p-3 bg-error/10 rounded-full text-error glow-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-display font-extrabold text-on_surface tracking-tight uppercase">Anomalía de Identidad Detectada</p>
                        <p className="text-xs font-bold text-on_surface opacity-50 tracking-widest uppercase">Objetivo: {report.tecnico?.nombre || 'Anónimo'} • Razón: {report.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                      <button 
                        onClick={() => suspendTech(report.tecnicoId)}
                        className="flex-grow md:flex-none px-8 py-3 bg-error text-white rounded-lg font-display font-extrabold text-[10px] hover:opacity-90 shadow-lg transition-all active:scale-95 uppercase tracking-widest"
                      >
                        REVOCAR TODOS LOS ACCESOS
                      </button>
                      <button 
                        onClick={() => dismissAlert(report.id)}
                        className="flex-grow md:flex-none px-8 py-3 bg-surface_container_high text-on_surface opacity-40 rounded-lg font-display font-extrabold text-[10px] hover:opacity-100 transition-all uppercase tracking-widest"
                      >
                        DESCARTAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Content Section */}
            {activeTab === 'tecnicos' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-display font-extrabold text-primary uppercase tracking-[0.3em]">Manifiesto de Registro</h3>
                    <p className="text-sm font-medium text-on_surface opacity-40">Distribución de personal y monitoreo de estado</p>
                  </div>
                  <div className="flex bg-surface_container_highest p-1 rounded-sm no-border">
                    {['All', 'Venezuela', 'Perú', 'RD'].map(country => (
                      <button
                        key={country}
                        onClick={() => setFilterCountry(country)}
                        className={`px-6 py-2 rounded-sm text-[10px] font-display font-extrabold tracking-widest uppercase transition-all ${
                          filterCountry === country 
                            ? 'trust-gradient text-white shadow-md' 
                            : 'text-on_surface opacity-40 hover:opacity-100'
                        }`}
                      >
                        {country === 'All' ? 'Alcance Total' : country}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-surface_container_lowest rounded-lg shadow-ambient overflow-hidden no-border">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface_container_highest/30">
                        <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Personal</th>
                        <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Región</th>
                        <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">ID Cuadrilla</th>
                        <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Estado</th>
                        <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-right">Protocolo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface_container_high/30">
                      {filteredSquad.map(tech => (
                        <tr key={tech.id} className="hover:bg-surface_container_low transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-surface_container_highest overflow-hidden border-2 border-primary/5">
                                {tech.foto && <img src={tech.foto} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <span className="font-display font-extrabold text-on_surface tracking-tight uppercase text-xs">{tech.nombre}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="bg-surface_container_highest px-3 py-1 rounded-sm inline-block">
                                <span className="text-[10px] font-display font-extrabold text-primary uppercase tracking-widest">{tech.pais}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            {tech.cuadrillaId ? (
                              <span className="text-xs font-bold text-on_surface opacity-60 tracking-tighter">
                                {cuadrillas.find(c => c.id === tech.cuadrillaId)?.nombre || 'ASIGNADO'}
                              </span>
                            ) : (
                              <select 
                                className="text-[10px] font-display font-extrabold bg-surface_container_high text-primary px-3 py-1.5 rounded-sm uppercase tracking-widest no-border outline-none focus:ring-1 ring-primary/20 cursor-pointer"
                                onChange={(e) => assignToCuadrilla(tech.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="" disabled>SIN ASIGNAR</option>
                                {cuadrillas.map(c => (
                                  <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                              tech.status === 'ACTIVO' ? 'bg-green-500/10 text-green-600' : 'bg-error/10 text-error'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tech.status === 'ACTIVO' ? 'bg-green-500 glow-pulse' : 'bg-error'}`} />
                              <span className="text-[9px] font-display font-extrabold uppercase tracking-widest">{tech.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="text-[10px] font-display font-extrabold text-primary hover:opacity-70 transition-opacity uppercase tracking-[0.2em]">
                              Detalle de Auditoría
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                 <div className="flex items-center space-x-4 px-2">
                    <h3 className="text-[10px] font-display font-extrabold text-primary uppercase tracking-[0.3em]">Formaciones Tácticas</h3>
                    <div className="h-px bg-primary/10 flex-grow"></div>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cuadrillas.map(cuadrilla => (
                    <div key={cuadrilla.id} className="bg-surface_container_lowest rounded-lg shadow-ambient p-8 space-y-6 no-border group hover:scale-[1.02] transition-transform">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-display font-extrabold text-on_surface tracking-tight uppercase">{cuadrilla.nombre}</h4>
                          <p className="text-[10px] font-bold text-on_surface opacity-30 uppercase tracking-widest">{cuadrilla.zona}</p>
                        </div>
                        <div className="bg-primary/5 px-3 py-1 rounded-sm">
                           <span className="text-[10px] font-display font-extrabold text-primary uppercase">
                            {cuadrilla.tecnicos?.length || 0} Units
                           </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-surface_container_high/30">
                        <p className="text-[9px] font-display font-extrabold text-on_surface opacity-20 uppercase tracking-[0.3em]">Manifiesto de Despliegue</p>
                        <div className="space-y-3">
                          {cuadrilla.tecnicos?.map(tech => (
                            <div key={tech.id} className="flex justify-between items-center group/item">
                              <span className="text-xs font-bold text-on_surface opacity-60 group-hover/item:opacity-100 transition-opacity uppercase tracking-tight">{tech.nombre}</span>
                              <button 
                                onClick={() => removeFromCuadrilla(cuadrilla.id, tech.id)}
                                className="w-6 h-6 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-error hover:text-white"
                              >
                                <span className="text-sm font-bold">&times;</span>
                              </button>
                            </div>
                          ))}
                          {(!cuadrilla.tecnicos || cuadrilla.tecnicos.length === 0) && (
                            <p className="text-xs text-on_surface opacity-20 italic">Sin activos asignados</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      const nombre = prompt('Squad Name:');
                      const zona = prompt('Zone Designation:');
                      if (nombre && zona) apiService.createCuadrilla({ nombre, zona }).then(() => fetchData());
                    }}
                    className="bg-surface_container_highest/20 border-2 border-dashed border-primary/10 rounded-lg flex flex-col items-center justify-center p-10 text-primary/40 hover:border-primary/40 hover:text-primary transition-all group min-h-[220px]"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center group-hover:border-primary/40 mb-4">
                      <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="text-[10px] font-display font-extrabold uppercase tracking-[0.3em]">Inicializar Cuadrilla</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoordinatorMonitor;
