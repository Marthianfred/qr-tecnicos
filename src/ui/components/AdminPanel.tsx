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
      setNotification({ message: `Stock of ${editingItem.name} updated`, type: 'success' });
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
      setNotification({ message: `Role of ${editingUser.name} updated to ${newRole}`, type: 'success' });
    }
  };

  const handleApproveOrder = async (id: string) => {
    setProcessingId(id);
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Success', statusLabel: 'Paid' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Transaction ${id} authorized successfully`, type: 'success' });
  };

  const handleRejectOrder = async (id: string) => {
    setProcessingId(id);
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Error', statusLabel: 'Denied' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Transaction ${id} has been denied`, type: 'error' });
  };

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen bg-surface font-sans text-on_surface relative">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-8 right-8 z-50 p-6 rounded-lg shadow-ambient glassmorphism no-border transform transition-all animate-bounce ${
          notification.type === 'success' ? 'text-primary' : 'text-error'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-xl">{notification.type === 'success' ? '✓' : '✕'}</span>
            <p className="font-display font-extrabold uppercase tracking-widest text-[10px]">{notification.message}</p>
          </div>
        </div>
      )}

      <header className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 mb-2">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            <span className="text-[10px] font-display font-extrabold text-primary uppercase tracking-[0.4em]">TrustLayer Infrastructure</span>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-on_surface tracking-tighter uppercase leading-none">Global Control Panel</h1>
          <p className="text-sm font-medium text-on_surface opacity-40 uppercase tracking-widest">Authority: Chief Administrator Marta</p>
        </div>
        
        <div className="relative group">
          <input
            type="text"
            placeholder={`Filter ${activeTab}...`}
            className="pl-12 pr-6 py-4 bg-surface_container_highest text-on_surface sm:text-xs font-display font-extrabold uppercase tracking-widest input-ghost-border w-full lg:w-80 no-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
        </div>
      </header>

      <div className="flex space-x-8 mb-10 border-none bg-surface_container_highest/30 p-1 rounded-sm w-fit">
        {(['inventory', 'orders', 'roles'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-sm font-display font-extrabold text-[10px] uppercase tracking-[0.2em] transition-all ${
              activeTab === tab
                ? 'trust-gradient text-white shadow-lg'
                : 'text-on_surface opacity-40 hover:opacity-100'
            }`}
          >
            {tab === 'inventory' ? 'Registry' : tab === 'orders' ? 'Transactions' : 'Privileges'}
          </button>
        ))}
      </div>

      <div className="bg-surface_container_lowest rounded-lg shadow-ambient overflow-hidden no-border">
        {activeTab === 'inventory' && (
          <table className="w-full text-left">
            <thead className="bg-surface_container_highest/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Asset Name</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Serial ID (SKU)</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Classification</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-right">Available</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface_container_high/30">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-surface_container_low transition-colors group">
                    <td className="px-8 py-5 font-display font-extrabold text-xs uppercase tracking-tight">{item.name}</td>
                    <td className="px-8 py-5 font-display font-bold text-[10px] text-primary opacity-60">{item.sku}</td>
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.category}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`font-display font-extrabold ${item.stock < 10 ? 'text-error' : 'text-on_surface'}`}>
                        {item.stock.toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center space-x-3">
                        <button 
                          onClick={() => handleEditStock(item)}
                          className="w-8 h-8 glassmorphism rounded-full flex items-center justify-center text-primary hover:scale-110 transition-transform" 
                          title="Modify Manifest"
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-[10px] font-display font-extrabold opacity-20 uppercase tracking-[0.3em]">No records matching query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <table className="w-full text-left">
            <thead className="bg-surface_container_highest/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Ticket ID</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Requester</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-right">Magnitude</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Security Status</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface_container_high/30">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface_container_low transition-colors">
                    <td className="px-8 py-5 font-display font-bold text-[10px] text-primary">{order.id}</td>
                    <td className="px-8 py-5 font-display font-extrabold text-xs uppercase tracking-tight">{order.customer}</td>
                    <td className="px-8 py-5 text-[10px] font-bold opacity-40 uppercase">{order.date}</td>
                    <td className="px-8 py-5 text-right font-display font-extrabold tracking-tighter">${order.total.toFixed(2)}</td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={order.status} label={order.statusLabel} />
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center space-x-3">
                        {order.status === 'Warning' ? (
                          <>
                            <button 
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={processingId === order.id}
                              className={`trust-gradient text-white px-4 py-2 rounded-sm text-[10px] font-display font-extrabold uppercase tracking-widest hover:opacity-90 transition-all ${processingId === order.id ? 'opacity-70' : ''}`}
                            >
                              {processingId === order.id ? <Spinner /> : 'Grant'}
                            </button>
                            <button 
                              onClick={() => handleRejectOrder(order.id)}
                              disabled={processingId === order.id}
                              className="bg-surface_container_highest text-error px-4 py-2 rounded-sm text-[10px] font-display font-extrabold uppercase tracking-widest hover:bg-surface_container_high transition-all"
                            >
                              Deny
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] font-display font-extrabold opacity-20 uppercase tracking-widest">Finalized</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-500">
                    <p className="text-[10px] font-display font-extrabold opacity-20 uppercase tracking-[0.3em]">No transaction logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'roles' && (
          <table className="w-full text-left">
            <thead className="bg-surface_container_highest/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Personnel Name</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Contact Vector</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em]">Active Clearence</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Network State</th>
                <th className="px-8 py-5 text-[10px] font-display font-extrabold text-on_surface opacity-40 uppercase tracking-[0.2em] text-center">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface_container_high/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface_container_low transition-colors">
                  <td className="px-8 py-5 font-display font-extrabold text-xs uppercase tracking-tight">{user.name}</td>
                  <td className="px-8 py-5 text-[10px] font-bold opacity-40">{user.email}</td>
                  <td className="px-8 py-5">
                    <span className="bg-surface_container_highest px-3 py-1 rounded-sm text-[10px] font-display font-extrabold text-primary uppercase tracking-widest">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 glow-pulse"></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Verified</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => handleEditRole(user)}
                      className="text-[10px] font-display font-extrabold text-primary hover:opacity-70 transition-all uppercase tracking-[0.2em]"
                    >
                      Shift Privilege
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Stock Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 glassmorphism flex items-center justify-center z-50 p-6 no-border">
          <div className="bg-surface_container_lowest rounded-lg shadow-ambient max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 no-border">
            <div className="trust-gradient p-8 text-white">
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Modify Asset Manifest</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1">Registry Correction Protocol</p>
            </div>
            <div className="p-10 space-y-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Target Item</p>
                <p className="text-lg font-display font-extrabold uppercase tracking-tight">{editingItem.name}</p>
                <p className="text-[10px] font-display font-bold text-primary tracking-widest">{editingItem.sku}</p>
              </div>
              
              <div className="space-y-6">
                <label className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] block">
                  New Quantity (Physical Count)
                </label>
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                    className="w-12 h-12 rounded-full glassmorphism flex items-center justify-center hover:bg-surface_container_high font-light text-2xl transition-all"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-24 text-center bg-transparent border-b-2 border-primary/10 focus:border-primary outline-none text-3xl font-display font-extrabold py-2"
                  />
                  <button 
                    onClick={() => setNewStock(prev => prev + 1)}
                    className="w-12 h-12 rounded-full glassmorphism flex items-center justify-center hover:bg-surface_container_high font-light text-2xl transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-surface_container_high text-on_surface opacity-40 font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-100 transition-all rounded-sm"
                >
                  Abstain
                </button>
                <button 
                  onClick={saveStock}
                  className="flex-1 px-6 py-4 trust-gradient text-white font-display font-extrabold text-[10px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all rounded-sm"
                >
                  Commit Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && editingUser && (
        <div className="fixed inset-0 glassmorphism flex items-center justify-center z-50 p-6 no-border">
          <div className="bg-surface_container_lowest rounded-lg shadow-ambient max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 no-border">
            <div className="trust-gradient p-8 text-white">
              <h3 className="text-xl font-display font-extrabold uppercase tracking-tight">Escalate Privileges</h3>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1">Hierarchical Shift Authority</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Personnel Account</p>
                <p className="text-lg font-display font-extrabold uppercase tracking-tight">{editingUser.name}</p>
                <p className="text-[10px] font-bold opacity-30 tracking-widest">{editingUser.email}</p>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mb-4">Select Authorization Level:</p>
                {(['admin', 'coordinator', 'technician', 'CLIENT'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => updateRole(role)}
                    className={`w-full text-left px-6 py-4 rounded-sm transition-all flex items-center justify-between uppercase tracking-widest text-[10px] font-display font-extrabold ${
                      editingUser.role === role 
                        ? 'trust-gradient text-white shadow-md' 
                        : 'bg-surface_container_high/30 hover:bg-surface_container_high text-on_surface opacity-50 hover:opacity-100'
                    }`}
                  >
                    <span>{role === 'CLIENT' ? 'External Citizen' : role}</span>
                    {editingUser.role === role && <span>✓</span>}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="w-full px-6 py-4 bg-surface_container_high text-on_surface opacity-40 font-display font-extrabold text-[10px] uppercase tracking-widest hover:opacity-100 transition-all rounded-sm mt-4"
              >
                Abstain from change
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="mt-20 text-center opacity-10 font-display font-extrabold text-[8px] uppercase tracking-[0.5em]">
         Digital Sovereignty Systems • Architectural Guardian Protocol 2.0
      </footer>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
  let textColor = 'text-primary';
  let bgColor = 'bg-primary/10';

  switch (status) {
    case 'Success':
      textColor = 'text-primary';
      bgColor = 'bg-primary/10';
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
    <span className={`${bgColor} ${textColor} px-4 py-1.5 rounded-full text-[9px] font-display font-extrabold uppercase tracking-widest shadow-sm`}>
      {label}
    </span>
  );
};

const Spinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4 text-white mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default AdminPanel;
