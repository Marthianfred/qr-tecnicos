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
    
    expect(screen.getByText('Security Clearence')).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Vector \(Email\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Legal Designation/i)).toBeInTheDocument();
    expect(screen.getByText('Asset Manifest')).toBeInTheDocument();
    const totals = screen.getAllByText('$150.00');
    expect(totals.length).toBeGreaterThan(0);
  });

  test('shows error message when required fields are empty', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    const submitButton = screen.getByRole('button', { name: /Initiate Sovereign Transfer/i });
    fireEvent.click(submitButton);

    // If required attribute is working in JSDOM, we might need to use fireEvent.submit
    // but the component also has manual validation.
    expect(await screen.findByText(/Required protocol fields are missing./i)).toBeInTheDocument();
  });

  test('submits successfully and shows confirmation', async () => {
    render(<CheckoutB2C items={mockItems} total={150.00} />);
    
    fireEvent.change(screen.getByLabelText(/Contact Vector \(Email\)/i), { target: { value: 'carlos@test.com' } });
    fireEvent.change(screen.getByLabelText(/Full Legal Designation/i), { target: { value: 'Carlos Pérez' } });
    fireEvent.change(screen.getByLabelText(/Destination Protocol \(Address\)/i), { target: { value: 'Calle 123' } });
    fireEvent.change(screen.getByLabelText(/Credit Instrument Number/i), { target: { value: '4242424242424242' } });
    fireEvent.change(screen.getByLabelText(/Valid Until \(MM\/AA\)/i), { target: { value: '12/26' } });
    fireEvent.change(screen.getByLabelText(/Security Key \(CVC\)/i), { target: { value: '123' } });

    const submitButton = screen.getByRole('button', { name: /Initiate Sovereign Transfer/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/Transmitting Protocol.../i)).toBeInTheDocument();

    // Increase timeout for the simulated API call (2s)
    await waitFor(() => {
      expect(screen.getByText(/Clearence Approved/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Your provision request has been logged and authorized/i)).toBeInTheDocument();
  });
});
