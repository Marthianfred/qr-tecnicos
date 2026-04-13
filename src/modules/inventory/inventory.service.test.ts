import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { Product } from '../../entities/product.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('InventoryService', () => {
  let service: InventoryService;
  let redis: any;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            exists: jest.fn(),
            decrby: jest.fn(),
            incrby: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    redis = module.get('REDIS_CLIENT');
    repo = module.get(getRepositoryToken(Product));
  });

  it('should check availability from redis', async () => {
    redis.get.mockResolvedValue('50');
    const stock = await service.checkAvailability('1');
    expect(stock).toBe(50);
    expect(redis.get).toHaveBeenCalledWith('stock:1');
  });

  it('should reserve stock successfully if enough quantity', async () => {
    redis.get.mockResolvedValue('10');
    redis.decrby.mockResolvedValue(5);
    
    const success = await service.reserveStock('1', 5);
    
    expect(success).toBe(true);
    expect(redis.decrby).toHaveBeenCalledWith('stock:1', 5);
  });

  it('should fail to reserve stock if not enough quantity', async () => {
    redis.get.mockResolvedValue('3');
    
    const success = await service.reserveStock('1', 5);
    
    expect(success).toBe(false);
    expect(redis.decrby).not.toHaveBeenCalled();
  });

  it('should rollback if decrby results in negative stock (race condition)', async () => {
    redis.get.mockResolvedValue('10');
    redis.decrby.mockResolvedValue(-2);
    
    const success = await service.reserveStock('1', 5);
    
    expect(success).toBe(false);
    expect(redis.incrby).toHaveBeenCalledWith('stock:1', 5);
  });

  it('should release stock', async () => {
    await service.releaseStock('1', 5);
    expect(redis.incrby).toHaveBeenCalledWith('stock:1', 5);
  });

  it('should initialize redis in onModuleInit if keys do not exist', async () => {
    repo.find.mockResolvedValue([
      { id: '1', stock: 10 },
      { id: '2', stock: 20 },
    ]);
    redis.exists.mockResolvedValue(0); // 0 means false in ioredis exists if called with one key, but wait, usually it returns number of existing keys. 
    // In our code: const exists = await this.redis.exists(`stock:${producto.id}`);

    await service.onModuleInit();
    
    expect(redis.set).toHaveBeenCalledWith('stock:1', 10);
    expect(redis.set).toHaveBeenCalledWith('stock:2', 20);
  });
});
