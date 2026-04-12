import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  test('renders checkout form correctly', () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    expect(screen.getByText('Checkout Seguro')).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
    const totals = screen.getAllByText('$150.00');
    expect(totals.length).toBeGreaterThan(0);
  });

  test('shows error message when required fields are empty', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    const submitButton = screen.getByRole('button', { name: /Completar Compra/i });
    fireEvent.click(submitButton);

    // If required attribute is working in JSDOM, we might need to use fireEvent.submit
    // but the component also has manual validation.
    expect(await screen.findByText(/Por favor, completa todos los campos obligatorios/i)).toBeInTheDocument();
  });

  test('submits successfully and shows confirmation', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'carlos@test.com' } });
    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Carlos Pérez' } });
    fireEvent.change(screen.getByLabelText(/Dirección de Envío/i), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByLabelText(/Número de Tarjeta/i), { target: { value: '4242424242424242' } });
    fireEvent.change(screen.getByLabelText(/Expiración/i), { target: { value: '12/26' } });
    fireEvent.change(screen.getByLabelText(/CVC/i), { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /Completar Compra/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Procesando.../i)).toBeInTheDocument();

    // Increase timeout for the simulated API call (2s)
    await waitFor(() => {
      expect(screen.getByText(/¡Pedido Confirmado!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Gracias por tu compra, Carlos/i)).toBeInTheDocument();
  });
});
