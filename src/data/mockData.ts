export const MOCK_TECHNICIAN = {
  id: 'TECH-001',
  name: 'Juan Perez',
  status: 'En Línea',
  certification: 'Premium',
  photo: 'https://i.pravatar.cc/150?u=TECH-001',
  idDocument: '12.345.678',
};

export const MOCK_VISIT_QR = {
  code: 'FIBEX-QR-PROTOCOL-JWT-TOKEN-V2',
  expirySeconds: 900, 
};

export const INCONSISTENCY_REASONS = [
  { id: 'photo-mismatch', label: 'Discrepancia de foto' },
  { id: 'bad-behavior', label: 'Comportamiento inapropiado' },
  { id: 'unauthorized-access', label: 'Acceso no autorizado' },
  { id: 'other', label: 'Otros detalles' },
];

export const MOCK_COORDINATOR_ALERTS = [
  { id: 'alert-1', techName: 'Pedro Rodriguez', reason: 'Discrepancia de foto', status: 'Pendiente' },
];

export const MOCK_SQUAD_DATA = [
  { id: '1', name: 'Juan Perez', country: 'VE', status: 'Active', certification: 'Premium' },
  { id: '2', name: 'Maria Garcia', country: 'PE', status: 'Active', certification: 'Advanced' },
  { id: '3', name: 'Jose Luis', country: 'RD', status: 'Suspended', certification: 'Basic' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  initialStock: number;
  imageUrl: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    name: 'Plan Fibra 200 Mbps',
    description: 'Internet de alta velocidad para hogares.',
    price: 35.00,
    category: 'Internet',
    stock: 100,
    initialStock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'PROD-002',
    name: 'Plan Fibra 500 Mbps',
    description: 'Ultra velocidad para gamers y streaming 4K.',
    price: 55.00,
    category: 'Internet',
    stock: 50,
    initialStock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'PROD-003',
    name: 'Router WiFi 6 GDA',
    description: 'Hardware de nueva generación para máxima cobertura.',
    price: 80.00,
    category: 'Equipment',
    stock: 20,
    initialStock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'PROD-004',
    name: 'GDA TV Box Pro',
    description: 'Acceso a más de 100 canales en vivo y streaming.',
    price: 45.00,
    category: 'Equipment',
    stock: 15,
    initialStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
  },
];

export const MOCK_INVENTORY = [
  { id: 'inv-1', name: 'Modem Giga Fiber', sku: 'MOD-FIB-001', stock: 124, category: 'Equipment' },
  { id: 'inv-2', name: 'Router Dual Band AC1200', sku: 'ROU-DB-002', stock: 45, category: 'Equipment' },
  { id: 'inv-3', name: 'Cable Ethernet Cat6 (100m)', sku: 'CAB-ETH-003', stock: 15, category: 'Cables' },
  { id: 'inv-4', name: 'Antena NanoStation M5', sku: 'ANT-NS-004', stock: 8, category: 'Antennas' },
];

export const MOCK_ORDERS = [
  { id: 'ord-101', customer: 'Carlos Rodriguez', date: '2026-04-10', total: 85.50, status: 'Success', statusLabel: 'Pago' },
  { id: 'ord-102', customer: 'Ana Martinez', date: '2026-04-11', total: 120.00, status: 'Warning', statusLabel: 'Pendiente' },
  { id: 'ord-103', customer: 'Roberto Gomez', date: '2026-04-11', total: 45.99, status: 'Info', statusLabel: 'Enviado' },
  { id: 'ord-104', customer: 'Elena Blanco', date: '2026-04-12', total: 210.00, status: 'Error', statusLabel: 'Rechazado' },
];
