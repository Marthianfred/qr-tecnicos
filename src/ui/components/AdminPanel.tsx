import React, { useState, useEffect } from 'react';
import { MOCK_INVENTORY, MOCK_ORDERS } from '../../data/mockData';

export type UserRole = 'admin' | 'coordinator' | 'technician' | 'CLIENT';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  category: string;
}

interface OrderItem {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  statusLabel: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

const MOCK_USERS: UserAccount[] = [
  { id: '1', name: 'Marta Administradora', email: 'admin@fibex.com', role: 'admin', status: 'active' },
  { id: '2', name: 'Jorge Coordinador', email: 'coord@fibex.com', role: 'coordinator', status: 'active' },
  { id: '3', name: 'Roberto Técnico', email: 'technician', role: 'technician', status: 'active' },
  { id: '4', name: 'Carlos Cliente', email: 'carlos@gmail.com', role: 'CLIENT', status: 'active' },
  { id: '5', name: 'Ana Martínez', email: 'ana@fibex.com', role: 'technician', status: 'active' },
];

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'roles'>('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [orders, setOrders] = useState<OrderItem[]>(MOCK_ORDERS);
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.statusLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditStock = (item: InventoryItem) => {
    setEditingItem(item);
    setNewStock(item.stock);
    setIsModalOpen(true);
  };

  const saveStock = () => {
    if (editingItem) {
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, stock: newStock } : item
      ));
      setIsModalOpen(false);
      setNotification({ message: `Stock de ${editingItem.name} actualizado`, type: 'success' });
    }
  };

  const handleEditRole = (user: UserAccount) => {
    setEditingUser(user);
    setIsRoleModalOpen(true);
  };

  const updateRole = (newRole: UserRole) => {
    if (editingUser) {
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, role: newRole } : u
      ));
      setIsRoleModalOpen(false);
      setNotification({ message: `Rol de ${editingUser.name} actualizado a ${newRole}`, type: 'success' });
    }
  };

  const handleApproveOrder = async (id: string) => {
    setProcessingId(id);
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Success', statusLabel: 'Paid' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Transacción ${id} autorizada con éxito`, type: 'success' });
  };

  const handleRejectOrder = async (id: string) => {
    setProcessingId(id);
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Error', statusLabel: 'Denied' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Transacción ${id} ha sido denegada`, type: 'error' });
  };

  return (
    <div className="p-8 lg:p-12 max-w-screen-2xl mx-auto min-h-screen bg-surface font-sans text-on_surface relative">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-12 right-12 z-[100] p-6 rounded-xl shadow-2xl glassmorphism border border-white/10 transform transition-all animate-in slide-in-from-right duration-500 ${
          notification.type === 'success' ? 'text-primary' : 'text-error'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-primary/20' : 'bg-error/20'}`}>
              <span className="text-sm font-bold">{notification.type === 'success' ? '✓' : '✕'}</span>
            </div>
            <p className="font-display font-extrabold uppercase tracking-widest text-[10px]">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-12">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <img src="/logo.webp" alt="Fibex Logo" className="relative h-20 w-auto object-contain transition-transform hover:scale-105" />
            </div>
            <div className="h-16 w-px bg-on_surface/5 hidden lg:block"></div>
            <div className="space-y-1">
              <h1 className="text-4xl font-display font-black text-on_surface tracking-tight uppercase leading-none">
                Panel <span className="text-primary">Administrativo</span>
              </h1>
              <div className="flex items-center space-x-3">
                 <span className="text-[10px] font-display font-extrabold text-on_surface opacity-30 uppercase tracking-[0.4em]">Control de Infraestructura Crítica</span>
                 <span className="h-1.5 w-1.5 rounded-full bg-primary glow-pulse"></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-surface_container_highest/20 rounded-xl blur-sm group-focus-within:bg-primary/5 transition-all"></div>
              <input
                type="text"
                placeholder={`Buscar en ${activeTab === 'inventory' ? 'Inventario' : activeTab === 'orders' ? 'Transacciones' : 'Personal'}...`}
                className="relative pl-12 pr-6 py-4 bg-surface_container_highest border-none rounded-xl text-on_surface sm:text-xs font-display font-extrabold uppercase tracking-widest outline-none focus:ring-2 ring-primary/20 w-full lg:w-96 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>

            <div className="flex items-center space-x-4 bg-surface_container_low p-2 rounded-xl border border-white/5">
               <div className="w-10 h-10 rounded-lg trust-gradient flex items-center justify-center text-white font-display font-black shadow-lg">M</div>
               <div className="hidden lg:block">
                  <p className="text-[10px] font-display font-extrabold text-on_surface uppercase tracking-tighter">Marta Admin</p>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-widest opacity-60 italic">Senior Authority</p>
               </div>
            </div>
          </div>
        </header>

        {/* Navigation & Content Area */}
        <div className="space-y-8">
          <div className="flex items-center space-x-2 bg-surface_container_highest/50 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner">
            {(['inventory', 'orders', 'roles'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-3 px-8 py-3.5 rounded-xl font-display font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === tab
                    ? 'trust-gradient text-white shadow-xl scale-105'
                    : 'text-on_surface opacity-40 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                <span>
                  {tab === 'inventory' ? '📦 Inventario de Activos' : 
                   tab === 'orders' ? '📊 Historial de Provisión' : 
                   '👥 Gestión de Permisos'}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-surface_container_lowest rounded-3xl shadow-2xl overflow-hidden border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'inventory' && (
              <table className="w-full text-left">
                <thead className="bg-surface_container_highest/30">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Nombre del Activo</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">ID de Serie (SKU)</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Clasificación</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-right">Disponible</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_container_high/20">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-surface_container_low/50 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex flex-col">
                              <span className="font-display font-extrabold text-xs uppercase tracking-tight text-on_surface">{item.name}</span>
                              <span className="text-[9px] text-primary font-bold opacity-40 uppercase tracking-widest mt-1">Asset Verified ✓</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 font-display font-bold text-[10px] text-primary">{item.sku}</td>
                        <td className="px-10 py-6">
                           <span className="px-3 py-1 bg-surface_container_highest rounded-full text-[9px] font-bold uppercase tracking-widest opacity-50">{item.category}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className={`text-sm font-display font-black ${item.stock < 10 ? 'text-error animate-pulse' : 'text-on_surface'}`}>
                            {item.stock.toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-center">
                          <button 
                            onClick={() => handleEditStock(item)}
                            className="w-10 h-10 bg-surface_container_highest rounded-xl flex items-center justify-center text-primary hover:trust-gradient hover:text-white transition-all shadow-sm" 
                            title="Editar Inventario"
                          >
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-10 py-24 text-center">
                        <div className="flex flex-col items-center opacity-20">
                           <span className="text-4xl mb-4">🔍</span>
                           <p className="text-[10px] font-display font-extrabold uppercase tracking-[0.3em]">Sin registros coincidentes</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'orders' && (
              <table className="w-full text-left">
                <thead className="bg-surface_container_highest/30">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">ID Ticket</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Solicitante</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Fecha</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-right">Monto</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Seguridad</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_container_high/20">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface_container_low/50 transition-colors">
                        <td className="px-10 py-6 font-display font-bold text-[10px] text-primary">{order.id}</td>
                        <td className="px-10 py-6 font-display font-extrabold text-xs uppercase tracking-tight">{order.customer}</td>
                        <td className="px-10 py-6 text-[10px] font-bold opacity-40 uppercase">{order.date}</td>
                        <td className="px-10 py-6 text-right font-display font-black tracking-tighter text-sm">${order.total.toFixed(2)}</td>
                        <td className="px-10 py-6 text-center">
                          <StatusBadge status={order.status} label={order.statusLabel} />
                        </td>
                        <td className="px-10 py-6 text-center">
                          <div className="flex justify-center space-x-3">
                            {order.status === 'Warning' ? (
                              <>
                                <button 
                                  onClick={() => handleApproveOrder(order.id)}
                                  disabled={processingId === order.id}
                                  className={`trust-gradient text-white px-5 py-2.5 rounded-xl text-[10px] font-display font-extrabold uppercase tracking-widest hover:brightness-110 shadow-lg transition-all ${processingId === order.id ? 'opacity-50' : ''}`}
                                >
                                  {processingId === order.id ? <Spinner /> : 'AUTORIZAR'}
                                </button>
                                <button 
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={processingId === order.id}
                                  className="bg-error/10 text-error px-5 py-2.5 rounded-xl text-[10px] font-display font-extrabold uppercase tracking-widest hover:bg-error/20 transition-all"
                                >
                                  RECHAZAR
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] font-display font-extrabold opacity-20 uppercase tracking-widest">PROCESADO</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-10 py-24 text-center">
                        <p className="text-[10px] font-display font-extrabold opacity-20 uppercase tracking-[0.3em]">Historial de transacciones vacío</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'roles' && (
              <table className="w-full text-left">
                <thead className="bg-surface_container_highest/30">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Nombre del Personal</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Identificación</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Jerarquía</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Sistema</th>
                    <th className="px-10 py-6 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface_container_high/20">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface_container_low/50 transition-colors">
                      <td className="px-10 py-6 font-display font-extrabold text-xs uppercase tracking-tight">{user.name}</td>
                      <td className="px-10 py-6 text-[10px] font-bold opacity-40">{user.email}</td>
                      <td className="px-10 py-6">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[9px] font-display font-extrabold uppercase tracking-widest">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="inline-flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 glow-pulse"></span>
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 italic">CONECTADO</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <button 
                          onClick={() => handleEditRole(user)}
                          className="text-[9px] font-display font-extrabold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 transition-all uppercase tracking-[0.15em]"
                        >
                          Modificar Rango
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 glassmorphism flex items-center justify-center z-[200] p-6 no-border">
          <div className="bg-surface_container_lowest rounded-3xl shadow-ambient max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
            <div className="trust-gradient p-10 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">📦</div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight">Inventario de Activos</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1 italic">Protocolo de Ajuste Físico</p>
            </div>
            <div className="p-10 space-y-10">
              <div className="bg-surface_container_low p-6 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">Activo Seleccionado</p>
                <p className="text-xl font-display font-black uppercase tracking-tight text-on_surface">{editingItem.name}</p>
                <p className="text-[10px] font-display font-bold text-primary tracking-[0.3em] mt-1">{editingItem.sku}</p>
              </div>
              
              <div className="space-y-6">
                <label className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] block text-center">
                  Carga de Stock Actualizado
                </label>
                <div className="flex items-center justify-center space-x-8">
                  <button 
                    onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                    className="w-14 h-14 rounded-2xl bg-surface_container_highest flex items-center justify-center hover:trust-gradient hover:text-white text-2xl transition-all shadow-sm"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-28 text-center bg-transparent border-b-4 border-primary/20 focus:border-primary outline-none text-4xl font-display font-black py-2 transition-colors"
                  />
                  <button 
                    onClick={() => setNewStock(prev => prev + 1)}
                    className="w-14 h-14 rounded-2xl bg-surface_container_highest flex items-center justify-center hover:trust-gradient hover:text-white text-2xl transition-all shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-surface_container_high text-on_surface opacity-40 font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-100 transition-all rounded-xl"
                >
                  DESCARTE
                </button>
                <button 
                  onClick={saveStock}
                  className="flex-1 px-6 py-4 trust-gradient text-white font-display font-extrabold text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all rounded-xl"
                >
                  AUTORIZAR STOCK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && editingUser && (
        <div className="fixed inset-0 glassmorphism flex items-center justify-center z-[200] p-6 no-border">
          <div className="bg-surface_container_lowest rounded-3xl shadow-ambient max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/10">
            <div className="trust-gradient p-10 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">👥</div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight">Permisos de Acceso</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1 italic">Gestión de Roles Fibex</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-surface_container_low p-6 rounded-2xl border border-white/5">
                <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em] mb-1">Nombre del Personal</p>
                <p className="text-xl font-display font-black uppercase tracking-tight">{editingUser.name}</p>
                <p className="text-[10px] font-bold opacity-40 tracking-widest mt-1 italic">{editingUser.email}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4 text-center italic">Seleccione el Nivel de Autorización:</p>
                {(['admin', 'coordinator', 'technician', 'CLIENT'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => updateRole(role)}
                    className={`w-full text-left px-6 py-4 rounded-xl transition-all flex items-center justify-between uppercase tracking-widest text-[10px] font-display font-extrabold ${
                      editingUser.role === role 
                        ? 'trust-gradient text-white shadow-xl scale-105 z-10' 
                        : 'bg-surface_container_high/30 hover:bg-surface_container_high text-on_surface opacity-50 hover:opacity-100 border border-transparent'
                    }`}
                  >
                    <span>{role === 'CLIENT' ? 'CLIENTE EXTERNO' : role}</span>
                    {editingUser.role === role && <span className="bg-white/20 px-2 py-0.5 rounded text-[8px]">ACTIVE</span>}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="w-full px-6 py-4 bg-surface_container_high text-on_surface opacity-40 font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-100 transition-all rounded-xl mt-4"
              >
                CERRAR SIN CAMBIOS
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="mt-20 text-center opacity-10 font-display font-extrabold text-[8px] uppercase tracking-[0.5em]">
         FIBEX QR TÉCNICOS • PANEL DE AUTORIDAD CENTRAL V2.5
      </footer>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
  let textColor = 'text-primary';
  let bgColor = 'bg-primary/10';

  switch (status) {
    case 'Success':
      textColor = 'text-green-500';
      bgColor = 'bg-green-500/10';
      break;
    case 'Warning':
      textColor = 'text-error';
      bgColor = 'bg-error/10';
      break;
    case 'Error':
      textColor = 'text-error';
      bgColor = 'bg-error/20';
      break;
    default:
      textColor = 'text-on_surface opacity-40';
      bgColor = 'bg-surface_container_high';
  }

  return (
    <span className={`${bgColor} ${textColor} px-4 py-1.5 rounded-full text-[9px] font-display font-extrabold uppercase tracking-widest shadow-sm border border-white/5`}>
      {label}
    </span>
  );
};

const Spinner: React.FC = () => (
  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
);

export default AdminPanel;
