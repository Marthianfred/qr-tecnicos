import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCatalog from './ProductCatalog';
import { MOCK_PRODUCTS } from '../../data/mockData';

// Mock apiService to return mock products
const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Plan Fibra 200 Mbps',
    description: 'Internet de alta velocidad para hogares.',
    price: 35.00,
    category: 'Internet',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop',
  }
];

jest.mock('../services/api', () => ({
  apiService: {
    getProducts: jest.fn().mockResolvedValue([
      {
        id: 'PROD-001',
        name: 'Plan Fibra 200 Mbps',
        description: 'Internet de alta velocidad para hogares.',
        price: 35.00,
        category: 'Internet',
        stock: 100,
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop',
      }
    ]),
  },
}));

describe('ProductCatalog', () => {
  const mockOnAddToCart = jest.fn();
  const mockOnViewCart = jest.fn();

  it('renders product catalog title', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} onViewCart={mockOnViewCart} />);
    const title = await screen.findByRole('heading', { level: 1, name: /Service Manifest/i });
    expect(title).toBeInTheDocument();
  });

  it('renders products from mock data', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} onViewCart={mockOnViewCart} />);
    const firstProduct = await screen.findByText('Plan Fibra 200 Mbps');
    expect(firstProduct).toBeInTheDocument();
  });

  it('calls onAddToCart when clicking add button', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} onViewCart={mockOnViewCart} />);
    const addButtons = await screen.findAllByText(/Acquire Asset/i);
    fireEvent.click(addButtons[0]);
    expect(mockOnAddToCart).toHaveBeenCalledWith(expect.objectContaining({ name: 'Plan Fibra 200 Mbps' }));
  });

  it('filters products by search term', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} onViewCart={mockOnViewCart} />);
    const searchInput = await screen.findByPlaceholderText(/Search assets and utility protocols.../i);
    
    fireEvent.change(searchInput, { target: { value: 'Non-existent' } });
    expect(screen.getByText(/No records in current scope/i)).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Fibra' } });
    expect(await screen.findByText('Plan Fibra 200 Mbps')).toBeInTheDocument();
  });

  it('displays error message and retry button when API fails', async () => {
    const { apiService } = require('../services/api');
    apiService.getProducts.mockRejectedValueOnce(new Error('API Error'));

    render(<ProductCatalog onAddToCart={mockOnAddToCart} onViewCart={mockOnViewCart} />);
    
    const errorMessage = await screen.findByText(/Connection issues detected. Defaulting to local manifest./i);
    expect(errorMessage).toBeInTheDocument();
    
    const retryButton = screen.getByText(/Re-Establish Connection/i);
    expect(retryButton).toBeInTheDocument();
  });
});
