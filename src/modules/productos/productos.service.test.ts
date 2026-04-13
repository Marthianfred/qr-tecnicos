import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './productos.service';
import { Product } from '../../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { PricingService } from '../pricing/pricing.service';
import { Like } from 'typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('ProductsService', () => {
  let service: ProductsService;
  let inventoryService: InventoryService;
  let pricingService: PricingService;

  const mockProductRepository = {
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
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
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

    service = module.get<ProductsService>(ProductsService);
    inventoryService = module.get<InventoryService>(InventoryService);
    pricingService = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStockRealTime', () => {
    it('should return stock from InventoryService', async () => {
      mockProductRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockInventoryService.checkAvailability.mockResolvedValue(10);
      const result = await service.getStockRealTime('123');
      expect(result).toEqual({ id: '123', stock: 10 });
      expect(mockInventoryService.checkAvailability).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getStockRealTime('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPrecioDinamico', () => {
    it('should return price from PricingService', async () => {
      mockProductRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockPricingService.calculateDynamicPrice.mockResolvedValue(120);
      const result = await service.getPrecioDinamico('123');
      expect(result).toEqual({ id: '123', price: 120 });
      expect(mockPricingService.calculateDynamicPrice).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getPrecioDinamico('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('reservarStock', () => {
    it('should call reserveStock from InventoryService', async () => {
      mockProductRepository.findOneBy.mockResolvedValue({ id: '123' });
      mockInventoryService.reserveStock.mockResolvedValue(true);
      const result = await service.reservarStock('123', 5);
      expect(result).toBe(true);
      expect(mockInventoryService.reserveStock).toHaveBeenCalledWith('123', 5);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.reservarStock('123', 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all active products', async () => {
      mockProductRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { active: true }
      });
    });

    it('should filter by category', async () => {
      mockProductRepository.find.mockResolvedValue([]);
      await service.findAll({ categoria: 'Electrónica' });
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { active: true, categoria: 'Electrónica' }
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const producto = { id: '123', name: 'Test' };
      mockProductRepository.findOneBy.mockResolvedValue(producto);
      const result = await service.findOne('123');
      expect(result).toEqual(producto);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySku', () => {
    it('should return a product by sku', async () => {
      const producto = { id: '123', sku: 'SKU-001' };
      mockProductRepository.findOneBy.mockResolvedValue(producto);
      const result = await service.findBySku('SKU-001');
      expect(result).toEqual(producto);
    });

    it('should throw NotFoundException if product SKU not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findBySku('SKU-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search products by query string in multiple fields', async () => {
      mockProductRepository.find.mockResolvedValue([]);
      await service.search('cable');
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: [
          { name: Like('%cable%'), active: true },
          { description: Like('%cable%'), active: true },
          { categoria: Like('%cable%'), active: true },
        ],
      });
    });
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const dto = { name: 'Router', price: 50, sku: 'RT-001' };
      mockProductRepository.create.mockReturnValue(dto);
      mockProductRepository.save.mockResolvedValue({ id: '123', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('123');
      expect(mockProductRepository.save).toHaveBeenCalled();
    });

    it('should set stockInicial if stock is provided but stockInicial is not', async () => {
      const dto = { name: 'Router', stock: 10, sku: 'RT-001' };
      mockProductRepository.create.mockImplementation((data) => data);
      mockProductRepository.save.mockImplementation((data) => ({ id: '123', ...data }));
      
      const result = await service.create(dto);
      expect(result.stockInicial).toBe(10);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and save a product', async () => {
      const existing = { id: '123', name: 'Old' };
      const updateDto = { name: 'New' };
      mockProductRepository.findOneBy.mockResolvedValue(existing);
      mockProductRepository.save.mockResolvedValue({ ...existing, ...updateDto });
      
      const result = await service.update('123', updateDto);
      expect(result.name).toBe('New');
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should set activo to false and save', async () => {
      const existing = { id: '123', active: true };
      mockProductRepository.findOneBy.mockResolvedValue(existing);
      mockProductRepository.save.mockResolvedValue({ ...existing, active: false });
      
      const result = await service.remove('123');
      expect(result.active).toBe(false);
      expect(mockProductRepository.save).toHaveBeenCalled();
    });
  });
});
