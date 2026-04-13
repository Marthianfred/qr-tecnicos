import React, { useState, useEffect } from 'react';
import { apiService, Technician, Country, Squad } from '../services/api';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'technicians' | 'squads' | 'countries' | 'logs'>('technicians');
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [t, c, q] = await Promise.all([
                apiService.getTechnicians(),
                apiService.getCountries(),
                apiService.getSquads()
            ]);
            setTechnicians(t);
            setCountries(c);
            setSquads(q);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-8">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Panel de Control Fibex</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Gestión de Operaciones • Sistema Central</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                    <button onClick={() => setActiveTab('technicians')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'technicians' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Técnicos</button>
                    <button onClick={() => setActiveTab('squads')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'squads' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Cuadrillas</button>
                    <button onClick={() => setActiveTab('countries')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'countries' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Países</button>
                </div>
            </header>

            <main className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 animate-pulse">Sincronizando con Base de Datos...</p>
                    </div>
                ) : (
                    <div className="p-10">
                        {activeTab === 'technicians' && (
                            <section className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-50">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Directorio de Técnicos</h2>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{technicians.length} Registrados</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {technicians.map(t => (
                                        <div key={t.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-300">
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-slate-100">
                                                    {t.photoUrl ? <img src={t.photoUrl} alt={t.name} className="w-full h-full object-cover" /> : <span className="text-2xl opacity-20">👤</span>}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 uppercase tracking-tighter">{t.name}</h3>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t.documentId}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {t.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase italic">{t.country}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'countries' && (
                            <section className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-50">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Regiones Operativas</h2>
                                    <button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Agregar País</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {countries.map(c => (
                                        <div key={c.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-2xl transition-all">
                                            <span className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">{c.flag}</span>
                                            <h3 className="font-black uppercase tracking-tighter text-slate-800 italic">{c.name}</h3>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{c.code}</p>
                                            <div className="mt-6 flex items-center space-x-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                <span className="text-[8px] font-black uppercase text-slate-500">{c.active ? 'OPERATIVO' : 'EN ESPERA'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'squads' && (
                            <section className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-50">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Gestión de Cuadrillas</h2>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-widest italic tracking-tight">{squads.length} Unidades Logísticas</span>
                                </div>
                                <div className="space-y-4">
                                    {squads.map(q => (
                                        <div key={q.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-2xl transition-all duration-300">
                                            <div className="flex items-center space-x-8">
                                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-blue-200">🚐</div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase tracking-tighter text-slate-800 italic">{q.name}</h3>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ZONA OPERATIVA: {q.zone}</p>
                                                </div>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-slate-900 transition-colors">Ver Detalles →</button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            <footer className="mt-16 text-center opacity-30 border-t border-slate-200 pt-8 flex justify-between items-center">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.5em]">Fibex Global Logistics • Sistema de Control v5.0 Master</p>
                <div className="flex space-x-6">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Protocolo Seguro Active</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-blue-600">Cifrado de Capa TrustLayer</span>
                </div>
            </footer>
        </div>
    );
};

export default AdminPanel;
