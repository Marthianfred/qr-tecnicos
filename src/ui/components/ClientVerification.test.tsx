import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientVerification from './ClientVerification';
import { apiService } from '../services/api';


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
    expect(screen.getByText(/Validando Identidad Digital.../i)).toBeInTheDocument();
  });

  test('renders success state with technician data', async () => {
    const mockTechData = {
      sub: 'TECH-123',
      name: 'Juan Perez',
      documentId: 'V-12345678',
      country: 'Venezuela',
      role: 'Técnico Especialista III',
      empresa: 'Fibex Services',
      nivel: 'Senior',
      foto: 'https:
    };
    (apiService.validateQR as jest.Mock).mockResolvedValue(mockTechData);

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/VALIDACIÓN EXITOSA/i)).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Técnico Especialista III')).toBeInTheDocument();
    expect(screen.getByText('V-12345678')).toBeInTheDocument();
    
    
    expect(screen.getByText(/Jurisdicción/i)).toBeInTheDocument();
    expect(screen.getByText(/Reportar Incidente de Seguridad/i)).toBeInTheDocument();
  });

  test('renders error state when token is missing', async () => {
    
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: jest.fn().mockReturnValue(null),
    })) as any;

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/ALERTA DE SEGURIDAD/i)).toBeInTheDocument();
    expect(screen.getByText(/DOCUMENTO NO VÁLIDO/i)).toBeInTheDocument();
  });

  test('renders error state when token is invalid', async () => {
    (apiService.validateQR as jest.Mock).mockRejectedValue(new Error('Invalid token'));

    render(<ClientVerification onReport={mockOnReport} />);

    expect(await screen.findByText(/ALERTA DE SEGURIDAD/i)).toBeInTheDocument();
    expect(screen.getByText(/Este código QR ha expirado o no pertenece al personal autorizado/i)).toBeInTheDocument();
    expect(screen.getByText(/LLAMAR AUTORIDADES/i)).toBeInTheDocument();
  });

  test('calls onReport when the report button is clicked', async () => {
    const mockTechData = {
      sub: 'TECH-123',
      name: 'Juan Perez',
      documentId: 'V-12345678',
      country: 'Venezuela',
      role: 'Técnico Especialista III',
      empresa: 'Fibex Services',
      nivel: 'Senior'
    };
    (apiService.validateQR as jest.Mock).mockResolvedValue(mockTechData);

    render(<ClientVerification onReport={mockOnReport} />);

    const reportButton = await screen.findByRole('button', { name: /Reportar Incidente de Seguridad/i });
    fireEvent.click(reportButton);

    expect(mockOnReport).toHaveBeenCalledTimes(1);
  });
});
