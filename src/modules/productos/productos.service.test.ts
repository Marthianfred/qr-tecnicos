import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductosService } from './productos.service';
import { Producto } from '../../entities/producto.entity';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';
import { Like } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('ProductosService', () => {
  let service: ProductosService;
  let inventoryService: InventoryService;
  let pricingService: PricingService;

  const mockProductoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockInventoryService = {
    checkAvailability: jest.fn(),
    reserveStock: jest.fn(),
    releaseStock: jest.fn(),
  };

  const mockPricingService = {
    calculateDynamicPrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockProductoRepository,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
    inventoryService = module.get<InventoryService>(InventoryService);
    pricingService = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStockRealTime', () => {
    it('should return stock from InventoryService', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockInventoryService.checkAvailability.mockResolvedValue(10);
      const result = await service.getStockRealTime('123');
      expect(result).toEqual({ id: '123', stock: 10 });
      expect(mockInventoryService.checkAvailability).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getStockRealTime('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPrecioDinamico', () => {
    it('should return price from PricingService', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockPricingService.calculateDynamicPrice.mockResolvedValue(120);
      const result = await service.getPrecioDinamico('123');
      expect(result).toEqual({ id: '123', precio: 120 });
      expect(mockPricingService.calculateDynamicPrice).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getPrecioDinamico('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reservarStock', () => {
    it('should call reserveStock from InventoryService', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockInventoryService.reserveStock.mockResolvedValue(true);
      const result = await service.reservarStock('123', 5);
      expect(result).toBe(true);
      expect(mockInventoryService.reserveStock).toHaveBeenCalledWith('123', 5);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.reservarStock('123', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all active products', async () => {
      mockProductoRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockProductoRepository.find).toHaveBeenCalledWith({
        where: { activo: true }
      });
    });

    it('should filter by category', async () => {
      mockProductoRepository.find.mockResolvedValue([]);
      await service.findAll({ categoria: 'Electrónica' });
      expect(mockProductoRepository.find).toHaveBeenCalledWith({
        where: { activo: true, categoria: 'Electrónica' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const producto = { id: '123', nombre: 'Test' };
      mockProductoRepository.findOneBy.mockResolvedValue(producto);
      const result = await service.findOne('123');
      expect(result).toEqual(producto);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySku', () => {
    it('should return a product by sku', async () => {
      const producto = { id: '123', sku: 'SKU-001' };
      mockProductoRepository.findOneBy.mockResolvedValue(producto);
      const result = await service.findBySku('SKU-001');
      expect(result).toEqual(producto);
    });

    it('should throw NotFoundException if product SKU not found', async () => {
      mockProductoRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findBySku('SKU-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search products by query string in multiple fields', async () => {
      mockProductoRepository.find.mockResolvedValue([]);
      await service.search('cable');
      expect(mockProductoRepository.find).toHaveBeenCalledWith({
        where: [
          { nombre: Like('%cable%'), activo: true },
          { descripcion: Like('%cable%'), activo: true },
          { categoria: Like('%cable%'), activo: true },
        ],
      });
    });
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const dto = { nombre: 'Router', precio: 50, sku: 'RT-001' };
      mockProductoRepository.create.mockReturnValue(dto);
      mockProductoRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
      expect(mockProductoRepository.save).toHaveBeenCalled();
    });

    it('should set stockInicial if stock is provided but stockInicial is not', async () => {
      const dto = { nombre: 'Router', stock: 10, sku: 'RT-001' };
      mockProductoRepository.create.mockImplementation((data) => data);
      mockProductoRepository.save.mockImplementation((data) => ({ id: '123', ...data }));
      
      const result = await service.create(dto);
      expect(result.stockInicial).toBe(10);
      expect(mockProductoRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and save a product', async () => {
      const existing = { id: '123', nombre: 'Old' };
      const updateDto = { nombre: 'New' };
      mockProductoRepository.findOneBy.mockResolvedValue(existing);
      mockProductoRepository.save.mockResolvedValue({ ...existing, ...updateDto });
      
      const result = await service.update('123', updateDto);
      expect(result.nombre).toBe('New');
      expect(mockProductoRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should set activo to false and save', async () => {
      const existing = { id: '123', activo: true };
      mockProductoRepository.findOneBy.mockResolvedValue(existing);
      mockProductoRepository.save.mockResolvedValue({ ...existing, activo: false });
      
      const result = await service.remove('123');
      expect(result.activo).toBe(false);
      expect(mockProductoRepository.save).toHaveBeenCalled();
    });
  });
});
