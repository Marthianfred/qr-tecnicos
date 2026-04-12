let API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

export interface Technician {
  id: string;
  nombre: string;
  documento: string;
  pais: string;
  status: string;
  certificaciones?: any[];
  foto?: string;
  cuadrillaId?: string;
}

export interface Cuadrilla {
  id: string;
  nombre: string;
  zona: string;
  supervisorId?: string;
  tecnicos?: Technician[];
}

export interface QRResponse {
  qr_token: string;
}

export interface InconsistencyReport {
  reason: string;
  details: string;
}

const getHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  async getTechnician(id: string): Promise<Technician> {
    const response = await fetch(`${API_BASE_URL}/tecnicos/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch technician');
    return response.json();
  },

  async generateQR(id: string): Promise<QRResponse> {
    const response = await fetch(`${API_BASE_URL}/tecnicos/${id}/qr`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to generate QR');
    return response.json();
  },

  async validateQR(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tecnicos/validate/${token}`);
    if (!response.ok) throw new Error('Invalid or expired token');
    return response.json();
  },

  async reportInconsistency(id: string, report: InconsistencyReport): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tecnicos/${id}/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        descripcion: report.reason,
        detalles: report.details,
      }),
    });
    if (!response.ok) throw new Error('Failed to submit report');
    return response.json();
  },

  async getTechnicians(): Promise<Technician[]> {
    const response = await fetch(`${API_BASE_URL}/tecnicos`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch technicians');
    return response.json();
  },

  async getReports(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/tecnicos/reports`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  },

  // Cuadrilla Methods
  async getCuadrillas(): Promise<Cuadrilla[]> {
    const response = await fetch(`${API_BASE_URL}/cuadrillas`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cuadrillas');
    return response.json();
  },

  async getCuadrilla(id: string): Promise<Cuadrilla> {
    const response = await fetch(`${API_BASE_URL}/cuadrillas/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cuadrilla');
    return response.json();
  },

  async createCuadrilla(data: Partial<Cuadrilla>): Promise<Cuadrilla> {
    const response = await fetch(`${API_BASE_URL}/cuadrillas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create cuadrilla');
    return response.json();
  },

  async assignTecnicosToCuadrilla(id: string, tecnicoIds: string[]): Promise<Cuadrilla> {
    const response = await fetch(`${API_BASE_URL}/cuadrillas/${id}/tecnicos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tecnicoIds }),
    });
    if (!response.ok) throw new Error('Failed to assign technicians');
    return response.json();
  },

  async removeTecnicoFromCuadrilla(id: string, tecnicoId: string): Promise<Cuadrilla> {
    const response = await fetch(`${API_BASE_URL}/cuadrillas/${id}/tecnicos/${tecnicoId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove technician');
    return response.json();
  },

  async login(username: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    return response.json();
  },

  // Ecommerce Methods
  async getProducts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/productos`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    // Map backend Spanish fields to frontend English fields used in components
    return data.map((p: any) => ({
      id: p.id,
      name: p.nombre,
      description: p.descripcion,
      price: parseFloat(p.precio),
      category: p.categoria,
      stock: p.stock,
      stockInicial: p.stockInicial,
      image: p.imagenUrl
    }));
  },

  async createOrder(order: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/productos/reservar`, { // Using reservar as a placeholder if no orders endpoint
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    // Fallback if /orders is not yet implemented
    if (!response.ok && response.status === 404) {
        console.warn('Orders endpoint not found, using simulation');
        return { id: 'SIM-ORDER-' + Math.random().toString(36).substr(2, 9) };
    }
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  }
};
