import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionService } from './transaction.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryType } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrisma = {
    transaction: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    service = new TransactionService(mockPrisma as unknown as PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query transactions with date filter and include relations', async () => {
      const mockTxs = [
        { id: 't1', amount: 50000, type: CategoryType.EXPENSE, transactionDate: new Date('2026-10-05') },
      ];
      mockPrisma.transaction.findMany.mockResolvedValue(mockTxs);

      const result = await service.findAll({
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        type: CategoryType.EXPENSE,
      });

      expect(result).toEqual(mockTxs);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a transaction converting date string to Date', async () => {
      const dto = {
        categoryId: 'cat1',
        type: CategoryType.EXPENSE,
        amount: 25000,
        description: 'Makan siang',
        transactionDate: '2026-10-15T12:00:00.000Z',
      };
      mockPrisma.transaction.create.mockResolvedValue({ id: 't2', ...dto, transactionDate: new Date(dto.transactionDate) });

      const result = await service.create(dto);
      expect(result.id).toBe('t2');
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          transactionDate: new Date(dto.transactionDate),
        },
      });
    });
  });

  describe('transfer', () => {
    it('should perform an atomic transaction creating outTx and inTx', async () => {
      const transferDto = {
        sourceCategoryId: 'cat-src',
        targetCategoryId: 'cat-dst',
        sourceCategoryName: 'Tabungan',
        targetCategoryName: 'Jajan',
        amount: 100000,
        description: 'Alokasi jajan',
        transactionDate: '2026-10-20T10:00:00.000Z',
      };

      const outTx = { id: 'out-1', amount: 100000, type: CategoryType.EXPENSE };
      const inTx = { id: 'in-1', amount: 100000, type: CategoryType.INCOME };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txPrisma = {
          transaction: {
            create: vi
              .fn()
              .mockResolvedValueOnce(outTx)
              .mockResolvedValueOnce(inTx),
          },
        };
        return callback(txPrisma);
      });

      const result = await service.transfer(transferDto);
      expect(result).toEqual({ outTx, inTx });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
