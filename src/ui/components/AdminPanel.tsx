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

  // Role editing state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Clear search when switching tabs
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  // Auto-hide notifications
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Success', statusLabel: 'Pagado' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Pedido ${id} aprobado con éxito`, type: 'success' });
  };

  const handleRejectOrder = async (id: string) => {
    setProcessingId(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: 'Error', statusLabel: 'Rechazado' } : order
    ));
    setProcessingId(null);
    setNotification({ message: `Pedido ${id} ha sido rechazado`, type: 'error' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-[600px] relative">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border-l-4 transform transition-all animate-bounce ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">{notification.type === 'success' ? '✅' : '❌'}</span>
            <p className="font-bold">{notification.message}</p>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A237E]">Panel de Administración</h1>
          <p className="text-gray-600">Gestión de inventario, pedidos y roles - Administradora Marta</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder={`Buscar en ${activeTab === 'inventory' ? 'inventario' : activeTab === 'orders' ? 'pedidos' : 'usuarios'}...`}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2962FF] focus:border-transparent outline-none w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </header>

      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'border-b-2 border-[#2962FF] text-[#2962FF]'
              : 'text-gray-500 hover:text-[#2962FF]'
          }`}
        >
          Inventario
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#2962FF] text-[#2962FF]'
              : 'text-gray-500 hover:text-[#2962FF]'
          }`}
        >
          Aprobación de Pedidos
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'roles'
              ? 'border-b-2 border-[#2962FF] text-[#2962FF]'
              : 'text-gray-500 hover:text-[#2962FF]'
          }`}
        >
          Gestión de Roles
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A237E] text-white">
              <tr>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">SKU</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-right">Stock</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="h-12 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-2">{item.name}</td>
                    <td className="px-6 py-2 font-mono text-sm">{item.sku}</td>
                    <td className="px-6 py-2">{item.category}</td>
                    <td className="px-6 py-2 text-right">
                      <span className={`font-bold ${item.stock < 10 ? 'text-[#C62828]' : 'text-gray-900'}`}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-2 text-center">
                      <button 
                        onClick={() => handleEditStock(item)}
                        className="text-[#2962FF] hover:bg-blue-50 p-2 rounded-full transition-colors" 
                        title="Editar Stock"
                      >
                        ✏️
                      </button>
                      <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors" title="Ver Detalle">🔍</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron productos que coincidan con "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A237E] text-white">
              <tr>
                <th className="px-6 py-4 font-bold">Pedido ID</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold text-right">Total</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="h-12 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-2 font-mono text-sm">{order.id}</td>
                    <td className="px-6 py-2">{order.customer}</td>
                    <td className="px-6 py-2">{order.date}</td>
                    <td className="px-6 py-2 text-right font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-2 text-center">
                      <StatusBadge status={order.status} label={order.statusLabel} />
                    </td>
                    <td className="px-6 py-2 text-center">
                      <div className="flex justify-center space-x-2">
                        {order.status === 'Warning' ? (
                          <>
                            <button 
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={processingId === order.id}
                              className={`bg-[#2962FF] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 transition-colors flex items-center ${processingId === order.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {processingId === order.id ? <Spinner /> : 'Aprobar'}
                            </button>
                            <button 
                              onClick={() => handleRejectOrder(order.id)}
                              disabled={processingId === order.id}
                              className="border border-[#C62828] text-[#C62828] px-3 py-1.5 rounded text-xs font-bold hover:bg-red-50 transition-colors"
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Procesado</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron pedidos que coincidan con "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A237E] text-white">
              <tr>
                <th className="px-6 py-4 font-bold">Usuario</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Rol Actual</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="h-12 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-2 font-medium">{user.name}</td>
                  <td className="px-6 py-2 text-gray-600">{user.email}</td>
                  <td className="px-6 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'coordinator' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'technician' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <span className="flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-[#2E7D32] mr-2"></span>
                      <span className="text-xs text-gray-600">Activo</span>
                    </span>
                  </td>
                  <td className="px-6 py-2 text-center">
                    <button 
                      onClick={() => handleEditRole(user)}
                      className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      Cambiar Rol
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Stock Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1A237E] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Actualizar Stock</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Producto</p>
                <p className="font-bold text-gray-900">{editingItem.name}</p>
                <p className="text-xs text-gray-400 font-mono">{editingItem.sku}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cantidad en Inventario
                </label>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-20 text-center border-b-2 border-gray-300 focus:border-[#2962FF] outline-none text-xl font-bold py-1"
                  />
                  <button 
                    onClick={() => setNewStock(prev => prev + 1)}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveStock}
                  className="flex-1 px-4 py-2 bg-[#2962FF] rounded-lg text-white font-bold hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRoleModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1A237E] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Modificar Rol de Usuario</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Usuario</p>
                <p className="font-bold text-gray-900">{editingUser.name}</p>
                <p className="text-xs text-gray-400">{editingUser.email}</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <p className="text-sm font-bold text-gray-700 mb-2">Seleccione un nuevo rol:</p>
                {(['admin', 'coordinator', 'technician', 'client'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => updateRole(role)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between capitalize ${
                      editingUser.role === role 
                        ? 'border-[#2962FF] bg-blue-50 text-[#2962FF]' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="font-bold">{role}</span>
                    {editingUser.role === role && <span>✓</span>}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
  let bgColor = '';
  let textColor = '';

  switch (status) {
    case 'Success':
      bgColor = 'bg-green-100';
      textColor = 'text-[#1B5E20]';
      break;
    case 'Warning':
      bgColor = 'bg-orange-100';
      textColor = 'text-[#E65100]';
      break;
    case 'Error':
      bgColor = 'bg-red-100';
      textColor = 'text-[#B71C1C]';
      break;
    case 'Info':
      bgColor = 'bg-blue-100';
      textColor = 'text-[#0D47A1]';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }

  return (
    <span className={`${bgColor} ${textColor} px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm`}>
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
