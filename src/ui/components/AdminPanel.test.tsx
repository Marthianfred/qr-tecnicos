import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminPanel from './AdminPanel';

// Mock mockData
jest.mock('../../data/mockData', () => ({
  MOCK_INVENTORY: [
    { id: '1', name: 'Router Fiber Extreme', sku: 'FIB-REX-001', stock: 15, category: 'Hardware' }
  ],
  MOCK_ORDERS: [
    { id: 'ORD-001', customer: 'Carlos Pérez', date: '2026-04-11', total: 150.00, status: 'Warning', statusLabel: 'Pendiente' },
    { id: 'ORD-002', customer: 'Marta Admin', date: '2026-04-11', total: 200.00, status: 'Info', statusLabel: 'Enviado' },
    { id: 'ORD-003', customer: 'Unknown User', date: '2026-04-11', total: 0.00, status: 'Other', statusLabel: 'Desconocido' }
  ]
}));

describe('AdminPanel Component', () => {
  test('renders inventory tab by default', () => {
    render(<AdminPanel />);
    
    expect(screen.getByText('Global Control Panel')).toBeInTheDocument();
    expect(screen.getByText('Registry')).toBeInTheDocument();
    expect(screen.getByText('Router Fiber Extreme')).toBeInTheDocument();
    expect(screen.getByText('FIB-REX-001')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('switches to orders tab', () => {
    render(<AdminPanel />);
    
    const ordersTab = screen.getByText('Transactions');
    fireEvent.click(ordersTab);
    
    expect(screen.getByText('Requester')).toBeInTheDocument();
    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  test('updates stock in inventory with minus and cancel', async () => {
    render(<AdminPanel />);
    
    const editButton = screen.getByTitle('Modify Manifest');
    fireEvent.click(editButton);
    
    const minusButton = screen.getByText('-');
    fireEvent.click(minusButton);
    
    const cancelButton = screen.getByText('Abstain');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Modify Asset Manifest')).not.toBeInTheDocument();
  });

  test('updates stock in inventory with plus and save', async () => {
    render(<AdminPanel />);
    
    const editButton = screen.getByTitle('Modify Manifest');
    fireEvent.click(editButton);
    
    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);
    
    const saveButton = screen.getByText('Commit Changes');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Stock of Router Fiber Extreme updated')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
  });

  test('approves an order', async () => {
    render(<AdminPanel />);
    
    const ordersTab = screen.getByText('Transactions');
    fireEvent.click(ordersTab);
    
    const approveButton = screen.getByText('Grant');
    fireEvent.click(approveButton);
    
    expect(await screen.findByText('Transaction ORD-001 authorized successfully')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Paid')).toBeInTheDocument();
    });
  });

  test('rejects an order', async () => {
    render(<AdminPanel />);
    
    const ordersTab = screen.getByText('Transactions');
    fireEvent.click(ordersTab);
    
    const rejectButton = screen.getByText('Deny');
    fireEvent.click(rejectButton);
    
    expect(await screen.findByText('Transaction ORD-001 has been denied')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Denied')).toBeInTheDocument();
    });
  });

  test('searches in inventory', () => {
    render(<AdminPanel />);
    
    const searchInput = screen.getByPlaceholderText('Filter inventory...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    
    expect(screen.getByText(/No records matching query/i)).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Router' } });
    expect(screen.getByText('Router Fiber Extreme')).toBeInTheDocument();
  });

  test('switches to roles tab and edits a user role', async () => {
    render(<AdminPanel />);
    
    const rolesTab = screen.getByText('Privileges');
    fireEvent.click(rolesTab);
    
    expect(screen.getByText('Marta Administradora')).toBeInTheDocument();
    expect(screen.getByText('Jorge Coordinador')).toBeInTheDocument();
    
    const changeRoleButtons = screen.getAllByText('Shift Privilege');
    fireEvent.click(changeRoleButtons[1]); // Click for Jorge
    
    expect(screen.getByText('Escalate Privileges')).toBeInTheDocument();
    
    // Find the technician button in the modal
    const technicianRoleButtons = screen.getAllByText(/technician/i);
    // The last one should be the one in the modal
    fireEvent.click(technicianRoleButtons[technicianRoleButtons.length - 1]);
    
    expect(await screen.findByText(/Role of Jorge Coordinador updated to technician/i)).toBeInTheDocument();
  });
});
