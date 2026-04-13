let API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};

export interface Technician {
  id: string;
  name: string;
  documentId: string;
  country: string;
  cargo?: string;
  zona?: string;
  tipoPersonal?: string;
  status: string;
  certificaciones?: any[];
  fotoUrl?: string;
  cuadrillaId?: string;
  departamento?: { id: string, name: string };
}

export interface Country {
  id: string;
  codigo: string;
  name: string;
  bandera: string;
  active: boolean;
}

export interface Squad {
  id: string;
  name: string;
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

let isRefreshing = false;

async function request(url: string, options: any = {}): Promise<any> {
  const isFormData = options.body instanceof FormData;
  const headers = { ...getHeaders(), ...options.headers };
  
  // Si es FormData, dejamos que el navegador ponga el Content-Type (boundary)
  if (isFormData) {
    delete (headers as any)['Content-Type'];
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh') && !isRefreshing) {
    isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('token', data.access_token);
          isRefreshing = false;
          // Retry original request
          return request(url, options);
        }
      } catch (e) {
        console.error('Failed to refresh token');
      }
    }
    
    // If refresh failed or no token, logout
    isRefreshing = false;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.reload(); // Force app to go back to login
    throw new Error('Sesión expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'La petición al servidor ha fallado' }));
    throw new Error(error.message || 'Error en la comunicación con el servidor');
  }

  return response.json();
}

export const apiService = {
  async getTechnician(id: string): Promise<Technician> {
    return request(`${API_BASE_URL}/technicians/${id}`);
  },

  async generateQR(id: string): Promise<QRResponse> {
    return request(`${API_BASE_URL}/technicians/${id}/qr-codes`, {
      method: 'POST',
    });
  },

  async validateQR(token: string): Promise<any> {
    return request(`${API_BASE_URL}/technicians/validations/${token}`);
  },

  async reportInconsistency(id: string, report: InconsistencyReport): Promise<any> {
    return request(`${API_BASE_URL}/technicians/${id}/inconsistency-reports`, {
      method: 'POST',
      body: JSON.stringify({
        description: report.reason,
        detalles: report.details,
      }),
    });
  },

  async getTechnicians(): Promise<Technician[]> {
    return request(`${API_BASE_URL}/technicians`);
  },

  async getReports(): Promise<any[]> {
    return request(`${API_BASE_URL}/technicians/inconsistency-reports`);
  },

  async resolveReport(id: string): Promise<any> {
    return request(`${API_BASE_URL}/technicians/inconsistency-reports/${id}`, {
      method: 'PATCH'
    });
  },

  // Company Methods
  async getCompanies(): Promise<any[]> {
    return request(`${API_BASE_URL}/empresas`);
  },

  async createCompany(data: any): Promise<any> {
    return request(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Personnel Photo
  async uploadPhoto(id: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${API_BASE_URL}/technicians/${id}/foto`, {
      method: 'PATCH',
      body: formData,
    });
  },

  // Bulk Upload (Excel/ETL)
  async uploadExcel(file: File, scope: string = 'GLOBAL'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${API_BASE_URL}/bulk-loads?scope=${scope}`, {
      method: 'POST',
      body: formData,
    });
  },

  async previewExcel(file: File, scope: string = 'GLOBAL'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return request(`${API_BASE_URL}/bulk-loads/simulation?scope=${scope}`, {
      method: 'POST',
      body: formData,
    });
  },

  // Security & Config
  async getDashboardStats(): Promise<any> {
    return request(`${API_BASE_URL}/technicians/statistics`);
  },

  // Squad Methods
  async getSquads(): Promise<Squad[]> {
    return request(`${API_BASE_URL}/squads`);
  },

  async getSquad(id: string): Promise<Squad> {
    return request(`${API_BASE_URL}/squads/${id}`);
  },

  async createSquad(data: Partial<Squad>): Promise<Squad> {
    return request(`${API_BASE_URL}/squads`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async assignTechniciansToSquad(id: string, tecnicoIds: string[]): Promise<Squad> {
    return request(`${API_BASE_URL}/squads/${id}/tecnicos`, {
      method: 'POST',
      body: JSON.stringify({ tecnicoIds }),
    });
  },

  async removeTechnicianFromSquad(id: string, tecnicoId: string): Promise<Squad> {
    return request(`${API_BASE_URL}/squads/${id}/tecnicos/${tecnicoId}`, {
      method: 'DELETE',
    });
  },

  async login(username: string, password: string): Promise<any> {
    const data = await request(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Persist tokens
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    
    return data;
  },

  // Ecommerce Methods
  async getProducts(): Promise<any[]> {
    const data = await request(`${API_BASE_URL}/products`);
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      category: p.categoria,
      stock: p.stock,
      stockInicial: p.stockInicial,
      image: p.imagenUrl
    }));
  },

  async createOrder(order: any): Promise<any> {
    try {
      return await request(`${API_BASE_URL}/productos/reservar`, { 
        method: 'POST',
        body: JSON.stringify(order),
      });
    } catch (e: any) {
      if (e.message?.includes('404')) {
        console.warn('Orders endpoint not found, using simulation');
        return { id: 'SIM-ORDER-' + Math.random().toString(36).substr(2, 9) };
      }
      throw e;
    }
  },

  // Gestión Internacional Dinámica (CRUD PAISES)
  async getCountries(): Promise<any[]> {
    return request(`${API_BASE_URL}/countries`);
  },

  async createCountry(data: any): Promise<any> {
    return request(`${API_BASE_URL}/countries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCountry(id: string, data: any): Promise<any> {
    return request(`${API_BASE_URL}/countries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCountry(id: string): Promise<any> {
    return request(`${API_BASE_URL}/countries/${id}`, {
      method: 'DELETE',
    });
  },

  // Management of Departments (CRUD)
  async getDepartments(): Promise<any[]> {
    return request(`${API_BASE_URL}/departments`);
  },

  async createDepartment(data: any): Promise<any> {
    return request(`${API_BASE_URL}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(id: string, data: any): Promise<any> {
    return request(`${API_BASE_URL}/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteDepartment(id: string): Promise<any> {
    return request(`${API_BASE_URL}/departments/${id}`, {
      method: 'DELETE',
    });
  },
};
