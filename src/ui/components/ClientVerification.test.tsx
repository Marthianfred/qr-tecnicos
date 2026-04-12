import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientVerification from './ClientVerification';
import { apiService } from '../services/api';

// Mock apiService
jest.mock('../services/api', () => ({
  apiService: {
    validateQR: jest.fn(),
  },
}));

describe('ClientVerification Component', () => {
  const mockOnReport = jest.fn();
  const originalURLSearchParams = global.URLSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock URLSearchParams to return a valid token by default
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: jest.fn().mockReturnValue('valid-token'),
    })) as any;
  });

  afterEach(() => {
    global.URLSearchParams = originalURLSearchParams;
  });

  test('renders loading state initially', () => {
    (apiService.validateQR as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<ClientVerification onReport={mockOnReport} />);
    expect(screen.getByText(/Verificando identidad/i)).toBeInTheDocument();
  });

  test('renders success state with technician data', async () => {
    const mockTechData = {
      sub: 'TECH-123',
      nombre: 'Juan Perez',
      documento: 'V-12345678',
      pais: 'Venezuela',
      nivel: 'Senior',
      foto: 'https://example.com/foto.jpg'
    };
    (apiService.validateQR as jest.Mock).mockResolvedValue(mockTechData);

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/Personal Verificado/i)).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText(/Técnico Nivel Senior/i)).toBeInTheDocument();
    expect(screen.getByText('V-12345678')).toBeInTheDocument();
    expect(screen.getByText('TECH-123')).toBeInTheDocument();
    
    // Check for the new trust elements
    expect(screen.getByText(/Validado el/i)).toBeInTheDocument();
    expect(screen.getByText(/Reportar Inconsistencia/i)).toBeInTheDocument();
  });

  test('renders error state when token is missing', async () => {
    // Mock URLSearchParams to return null for token
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: jest.fn().mockReturnValue(null),
    })) as any;

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/¡ALERTA DE SEGURIDAD!/i)).toBeInTheDocument();
    expect(screen.getByText(/No se proporcionó un token de verificación válido/i)).toBeInTheDocument();
  });

  test('renders error state when token is invalid', async () => {
    (apiService.validateQR as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/¡ALERTA DE SEGURIDAD!/i)).toBeInTheDocument();
    expect(screen.getByText(/IDENTIDAD NO CONFIRMADA/i)).toBeInTheDocument();
    expect(screen.getByText(/🚨 LLAMAR A EMERGENCIAS/i)).toBeInTheDocument();
  });

  test('calls onReport when the report button is clicked', async () => {
    const mockTechData = {
      sub: 'TECH-123',
      nombre: 'Juan Perez',
      documento: 'V-12345678',
      pais: 'Venezuela',
      nivel: 'Senior'
    };
    (apiService.validateQR as jest.Mock).mockResolvedValue(mockTechData);

    render(<ClientVerification onReport={mockOnReport} />);

    const reportButton = await screen.findByRole('button', { name: /Reportar Inconsistencia/i });
    fireEvent.click(reportButton);

    expect(mockOnReport).toHaveBeenCalledTimes(1);
  });
});
