import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckoutB2C from './CheckoutB2C';

const mockItems = [
  {
    product: {
      id: '1',
      name: 'Router Fiber Extreme',
      price: 150.00,
      description: 'High speed router',
      stock: 10,
      stockInicial: 100,
      image: '',
      category: 'hardware'
    },
    quantity: 1
  }
];

describe('CheckoutB2C Component', () => {
  test('renders checkout form correctly in Spanish', () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    expect(screen.getByText('Autorización de Seguridad')).toBeInTheDocument();
    expect(screen.getByLabelText(/Vector de Contacto \(Email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Designación Legal Completa/i)).toBeInTheDocument();
    expect(screen.getByText('Manifiesto de Activos')).toBeInTheDocument();
    const totals = screen.getAllByText('$150.00');
    expect(totals.length).toBeGreaterThan(0);
  });

  test('submits successfully and shows confirmation', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    fireEvent.change(screen.getByLabelText(/Vector de Contacto \(Email\)/i), { target: { value: 'carlos@test.com' } });
    fireEvent.change(screen.getByLabelText(/Designación Legal Completa/i), { target: { value: 'Carlos Pérez' } });
    fireEvent.change(screen.getByLabelText(/Protocolo de Destino \(Dirección\)/i), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByLabelText(/Número de Instrumento de Crédito/i), { target: { value: '4242424242424242' } });
    fireEvent.change(screen.getByLabelText(/Válido Hasta \(MM\/AA\)/i), { target: { value: '12/28' } });
    fireEvent.change(screen.getByLabelText(/Clave de Seguridad \(CVC\)/i), { target: { value: '123' } });

    fireEvent.click(screen.getByText(/Iniciar Transferencia Soberana/i));

    expect(await screen.findByText(/Autorización Aprobada/i, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/Su solicitud de provisión ha sido registrada/i)).toBeInTheDocument();
  });

  it('shows error when required fields are missing', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    fireEvent.click(screen.getByText(/Iniciar Transferencia Soberana/i));
    
    // El mensaje de error coincide con el componente
    expect(screen.getByText(/Faltan campos de protocolo requeridos para la autorización/i)).toBeInTheDocument();
  });
});
