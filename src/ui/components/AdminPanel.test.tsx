import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from './AdminPanel';

// Mock Services
jest.mock('../services/api', () => ({
  apiService: {
    getTechnicians: jest.fn().mockResolvedValue([]),
    getDashboardStats: jest.fn().mockResolvedValue({ technicians: 150, activeQrs: 450, alerts: 3, recentReports: [], squads: 12 }),
    getSquads: jest.fn().mockResolvedValue([]),
    getCompanies: jest.fn().mockResolvedValue([]),
    getCountryes: jest.fn().mockResolvedValue([
      { id: '1', name: 'Venezuela', codigo: 'VE', bandera: '🇻🇪', active: true },
      { id: '2', name: 'Perú', codigo: 'PE', bandera: '🇵🇪', active: true },
      { id: '3', name: 'República Dominicana', codigo: 'RD', bandera: '🇩🇴', active: true }
    ])
  }
}));

describe('AdminPanel Component (Localized)', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'admin' }));
  });

  test('renders operative dashboard by default', async () => {
    render(<AdminPanel />);
    
    const brandElements = screen.getAllByText(/Fibex/i);
    expect(brandElements.length).toBeGreaterThan(0);
    const consoleLabels = screen.getAllByText(/Consola de Control Central/i);
    expect(consoleLabels.length).toBeGreaterThan(0);
    
    await waitFor(() => {
      expect(screen.getAllByText(/Panel Operativo/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('150').length).toBeGreaterThan(0); // Técnicos Totales
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);   // Alertas Críticas
    });
  });

  test('switches to personnel management module', async () => {
    render(<AdminPanel />);
    
    const personnelTab = screen.getByText('Gestión de Personal');
    fireEvent.click(personnelTab);
    
    expect(screen.getByText(/Gestión de Perfiles Técnicos/i)).toBeInTheDocument();
    expect(screen.getByText(/Control de identidad, cargos y fotos/i)).toBeInTheDocument();
  });

  test('switches to global expansion module', async () => {
    render(<AdminPanel />);
    
    const expansionTab = screen.getByText('Expansión Global');
    fireEvent.click(expansionTab);
    
    expect(screen.getByText(/Expansión Global Fibex/i)).toBeInTheDocument();
    expect(screen.getByText(/Activar Nueva Sede/i)).toBeInTheDocument();
  });

  test('country selector updates successfully', async () => {
    render(<AdminPanel />);
    
    // Wait for countries to load
    await waitFor(() => {
      expect(screen.getByText('🇻🇪')).toBeInTheDocument();
    });
    
    const veButton = screen.getByText('🇻🇪');
    fireEvent.click(veButton);
    
    // El componente debería reflejar el cambio (aunque en el mock sea visual)
    expect(veButton.closest('button')).toHaveClass('text-blue-600');
  });

  test('shows construction notice for unimplemented modules', async () => {
    render(<AdminPanel />);
    
    const configTab = screen.getByText('Configuración');
    fireEvent.click(configTab);
    
    expect(screen.getByText(/Módulo en Construcción/i)).toBeInTheDocument();
  });
});
