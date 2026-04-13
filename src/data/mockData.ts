/**
 * Mock data for Fibex Qr Technicians (FIB-20)
 */

export const MOCK_TECHNICIAN = {
  id: 'TECH-001',
  name: 'Juan Pérez',
  status: 'En Línea',
  certification: 'Integral',
  photo: 'https://i.pravatar.cc/150?u=TECH-001',
  idDocument: '12.345.678',
};

export const MOCK_VISIT_QR = {
  code: 'FIBEX-QR-TECNICOS-JWT-TOKEN',
  expirySeconds: 900, // 15 minutes
};

export const INCONSISTENCY_REASONS = [
  { id: 'photo-mismatch', label: 'La foto no coincide' },
  { id: 'bad-behavior', label: 'Comportamiento inadecuado' },
  { id: 'other', label: 'Otros' },
];

export const MOCK_COORDINATOR_ALERTS = [
  { id: 'alert-1', techName: 'Pedro Rodríguez', reason: 'Foto no coincide', status: 'Pendiente' },
];

export const MOCK_SQUAD_DATA = [
  { id: '1', name: 'Juan Pérez', country: 'Venezuela', status: 'Activo', certification: 'Integral' },
  { id: '2', name: 'Maria Garcia', country: 'Perú', status: 'Activo', certification: 'Premium' },
  { id: '3', name: 'Jose Luis', country: 'RD', status: 'Suspendido', certification: 'Básico' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  stockInicial: number;
  image: string;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'PROD-001',
    name: 'Plan Fibra 200 Mbps',
    description: 'Internet de alta velocidad para hogares.',
    price: 35.00,
    category: 'Internet',
    stock: 100,
    stockInicial: 100,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop',
  },
  {
    id: 'PROD-002',
    name: 'Plan Fibra 500 Mbps',
    description: 'Ultra velocidad para gamers y streaming 4K.',
    price: 55.00,
    category: 'Internet',
    stock: 50,
    stockInicial: 50,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=300&h=200&fit=crop',
  },
  {
    id: 'PROD-003',
    name: 'Router WiFi 6 GDA',
    description: 'Hardware de última generación para máxima cobertura.',
    price: 80.00,
    category: 'Hardware',
    stock: 20,
    stockInicial: 20,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop',
  },
  {
    id: 'PROD-004',
    name: 'GDA TV Box',
    description: 'Acceso a más de 100 canales en vivo y streaming.',
    price: 45.00,
    category: 'Hardware',
    stock: 15,
    stockInicial: 15,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=300&h=200&fit=crop',
  },
];

export const MOCK_INVENTORY = [
  { id: 'inv-1', name: 'Módem Fibra Óptica Giga', sku: 'MOD-FIB-001', stock: 124, category: 'Hardware' },
  { id: 'inv-2', name: 'Router Dual Band AC1200', sku: 'ROU-DB-002', stock: 45, category: 'Hardware' },
  { id: 'inv-3', name: 'Cable Ethernet Cat6 (100m)', sku: 'CAB-ETH-003', stock: 15, category: 'Cables' },
  { id: 'inv-4', name: 'Antena NanoStation M5', sku: 'ANT-NS-004', stock: 8, category: 'Antenas' },
];

export const MOCK_ORDERS = [
  { id: 'ord-101', customer: 'Carlos Rodríguez', date: '2026-04-10', total: 85.50, status: 'Success', statusLabel: 'Pagado' },
  { id: 'ord-102', customer: 'Ana Martínez', date: '2026-04-11', total: 120.00, status: 'Warning', statusLabel: 'Pendiente' },
  { id: 'ord-103', customer: 'Roberto Gómez', date: '2026-04-11', total: 45.99, status: 'Info', statusLabel: 'Enviado' },
  { id: 'ord-104', customer: 'Elena Blanco', date: '2026-04-12', total: 210.00, status: 'Error', statusLabel: 'Rechazado' },
];
