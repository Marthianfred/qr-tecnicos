import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PricingService } from './pricing.service';
import { InventoryService } from '../inventory/inventory.service';
import { Product } from '../../entities/product.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('PricingService', () => {
  let service: PricingService;
  let inventoryService: InventoryService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: InventoryService,
          useValue: {
            checkAvailability: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    inventoryService = module.get<InventoryService>(InventoryService);
    repo = module.get(getRepositoryToken(Product));
  });

  it('should return base price when stock is high', async () => {
    const mockProduct = {
      id: '1',
      price: 100,
      stockInicial: 100,
    };
    repo.findOneBy.mockResolvedValue(mockProduct);
    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(50);

    const price = await service.calculateDynamicPrice('1');
    expect(price).toBe(100);
  });

  it('should increase price by 15% when stock is low (< 20%)', async () => {
    const mockProduct = {
      id: '1',
      price: 100,
      stockInicial: 100,
    };
    repo.findOneBy.mockResolvedValue(mockProduct);
    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(15);

    const price = await service.calculateDynamicPrice('1');
    expect(price).toBe(115);
  });

  it('should increase price by 30% when stock is very low (< 5%)', async () => {
    const mockProduct = {
      id: '1',
      price: 100,
      stockInicial: 100,
    };
    repo.findOneBy.mockResolvedValue(mockProduct);
    (inventoryService.checkAvailability as jest.Mock).mockResolvedValue(4);

    const price = await service.calculateDynamicPrice('1');
    expect(price).toBe(130);
  });
});
