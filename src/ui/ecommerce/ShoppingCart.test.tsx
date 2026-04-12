import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShoppingCart from './ShoppingCart';

const mockItems = [
  {
    product: {
      id: 'PROD-001',
      name: 'Plan Fibra 200 Mbps',
      description: 'Internet de alta velocidad para hogares.',
      price: 35.00,
      category: 'Internet',
      stock: 100,
      stockInicial: 100,
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop',
    },
    quantity: 2
  }
];

jest.mock('../services/api', () => ({
  apiService: {
    createOrder: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: 'ORDER-123' }), 100))),
  },
}));

describe('ShoppingCart', () => {
  const mockOnUpdateQuantity = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnOrderComplete = jest.fn();

  it('renders empty cart message when no items', () => {
    render(
      <ShoppingCart 
        items={[]} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    expect(screen.getByText(/Vault is currently empty/i)).toBeInTheDocument();
  });

  it('renders items in the cart', () => {
    render(
      <ShoppingCart 
        items={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    expect(screen.getByText('Plan Fibra 200 Mbps')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument(); // matches {item.quantity.toString().padStart(2, '0')}
  });

  it('calculates total correctly', () => {
    render(
      <ShoppingCart 
        items={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    // 35 * 2 = 70. 70 * 1.16 = 81.20
    expect(screen.getByText('$81.20')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when clicking plus button', () => {
    render(
      <ShoppingCart 
        items={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('PROD-001', 1);
  });

  it('calls onOrderComplete when checkout is successful', async () => {
    render(
      <ShoppingCart 
        items={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    const checkoutButton = screen.getByText(/Authorize & Clear/i);
    fireEvent.click(checkoutButton);
    
    const processingText = await screen.findByText(/Transmitting.../i);
    expect(processingText).toBeInTheDocument();
    
    await waitFor(() => {
        expect(mockOnOrderComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('displays error message when checkout fails', async () => {
    const { apiService } = require('../services/api');
    apiService.createOrder.mockRejectedValueOnce(new Error('API Error'));

    render(
      <ShoppingCart 
        items={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity} 
        onRemove={mockOnRemove} 
        onBack={mockOnBack}
        onOrderComplete={mockOnOrderComplete}
      />
    );
    
    const checkoutButton = screen.getByText(/Authorize & Clear/i);
    fireEvent.click(checkoutButton);
    
    const errorMessage = await screen.findByText(/A transmission error occurred. Please re-authenticate your request./i);
    expect(errorMessage).toBeInTheDocument();
  });
});
