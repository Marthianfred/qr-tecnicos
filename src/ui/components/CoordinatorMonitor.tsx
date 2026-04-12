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
        
        // Si es un reporte nuevo, lo añadimos a la lista para mostrar la alerta
        // El evento es 'report.created'
        if (payload.id && payload.reason) {
          setReports(prev => [payload, ...prev]);
        } else {
          // Para otros eventos (creación, cambio de status), refrescamos la data
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-inter">
      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-grow">
        {/* Simple Sidebar */}
        <aside className="w-64 bg-navy-900 text-white hidden md:block" style={{ backgroundColor: '#1A237E' }}>
          <div className="p-6">
            <h1 className="text-xl font-bold">Fibex Admin</h1>
          </div>
          <nav className="mt-4">
            <button 
              onClick={() => setActiveTab('tecnicos')}
              className={`w-full text-left flex items-center px-6 py-4 transition-colors ${activeTab === 'tecnicos' ? 'bg-navy-800 border-l-4 border-blue-500' : 'text-gray-400 hover:bg-navy-800'}`}
            >
              <span className="font-bold">Monitor de Técnicos</span>
            </button>
            <button 
              onClick={() => setActiveTab('cuadrillas')}
              className={`w-full text-left flex items-center px-6 py-4 transition-colors ${activeTab === 'cuadrillas' ? 'bg-navy-800 border-l-4 border-blue-500' : 'text-gray-400 hover:bg-navy-800'}`}
            >
              <span className="font-bold">Gestión de Cuadrillas</span>
            </button>
            <a href="#" className="flex items-center px-6 py-4 hover:bg-navy-800 transition-colors text-gray-400">
              <span>Reportes de Seguridad</span>
            </a>
            <a href="#" className="flex items-center px-6 py-4 hover:bg-navy-800 transition-colors text-gray-400">
              <span>Certificaciones</span>
            </a>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-grow flex flex-col">
          {/* Top Bar */}
          <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
              {activeTab === 'tecnicos' ? 'Monitor de Operaciones' : 'Gestión de Cuadrillas'}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {reports.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {reports.length}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                M
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8 overflow-y-auto">
            {/* Alerts Section */}
            {reports.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest">Alertas Críticas</h3>
                {reports.map(report => (
                  <div key={report.id} className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl flex justify-between items-center animate-bounce-short">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-red-800">Reporte de Inconsistencia: {report.tecnico?.nombre || 'Técnico Desconocido'}</p>
                        <p className="text-sm text-red-600">Motivo: {report.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => suspendTech(report.tecnicoId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 shadow-md transition-all active:scale-95"
                      >
                        SUSPENDER ACCESO
                      </button>
                      <button 
                        onClick={() => dismissAlert(report.id)}
                        className="px-4 py-2 bg-white text-gray-400 rounded-lg font-bold text-xs hover:text-gray-600 transition-all"
                      >
                        IGNORAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Content Section */}
            {activeTab === 'tecnicos' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Listado de Técnicos</h3>
                  <div className="flex space-x-2">
                    {['All', 'Venezuela', 'Perú', 'RD'].map(country => (
                      <button
                        key={country}
                        onClick={() => setFilterCountry(country)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          filterCountry === country 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        style={filterCountry === country ? { backgroundColor: '#2962FF' } : {}}
                      >
                        {country === 'All' ? 'Todos' : country}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-navy-900 text-xs font-bold uppercase tracking-wider" style={{ color: '#1A237E' }}>
                      <tr>
                        <th className="px-6 py-4">Técnico</th>
                        <th className="px-6 py-4">País</th>
                        <th className="px-6 py-4">Cuadrilla</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredSquad.map(tech => (
                        <tr key={tech.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                {tech.foto && <img src={tech.foto} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <span className="font-semibold text-gray-700">{tech.nombre}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">{tech.pais}</span>
                          </td>
                          <td className="px-6 py-4">
                            {tech.cuadrillaId ? (
                              <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-md">
                                {cuadrillas.find(c => c.id === tech.cuadrillaId)?.nombre || 'Asignado'}
                              </span>
                            ) : (
                              <select 
                                className="text-[10px] border rounded p-1"
                                onChange={(e) => assignToCuadrilla(tech.id, e.target.value)}
                                defaultValue=""
                              >
                                <option value="" disabled>Asignar...</option>
                                {cuadrillas.map(c => (
                                  <option key={c.id} value={c.id}>{c.nombre}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center space-x-1.5 text-xs font-bold ${
                              tech.status === 'ACTIVO' ? 'text-green-600' : 'text-red-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tech.status === 'ACTIVO' ? 'bg-green-600' : 'bg-red-500'}`} />
                              <span>{tech.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-tight" style={{ color: '#2962FF' }}>
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cuadrillas.map(cuadrilla => (
                    <div key={cuadrilla.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{cuadrilla.nombre}</h4>
                          <p className="text-xs text-gray-500">{cuadrilla.zona}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                          {cuadrilla.tecnicos?.length || 0} Técnicos
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Técnicos Asignados</p>
                        <div className="divide-y divide-gray-50">
                          {cuadrilla.tecnicos?.map(tech => (
                            <div key={tech.id} className="py-2 flex justify-between items-center text-sm">
                              <span className="text-gray-700">{tech.nombre}</span>
                              <button 
                                onClick={() => removeFromCuadrilla(cuadrilla.id, tech.id)}
                                className="text-red-400 hover:text-red-600 text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          {(!cuadrilla.tecnicos || cuadrilla.tecnicos.length === 0) && (
                            <p className="py-2 text-xs text-gray-400 italic">Sin técnicos</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const nombre = prompt('Nombre de la cuadrilla:');
                      const zona = prompt('Zona:');
                      if (nombre && zona) apiService.createCuadrilla({ nombre, zona }).then(() => fetchData());
                    }}
                    className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-all group min-h-[150px]"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-blue-400 mb-2">
                      <span className="text-xl">+</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Nueva Cuadrilla</span>
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
