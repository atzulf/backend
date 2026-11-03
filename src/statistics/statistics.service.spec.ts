import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatisticsService } from './statistics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryType } from '@prisma/client';

describe('StatisticsService', () => {
  let service: StatisticsService;

  const mockPrisma = {
    transaction: {
      findMany: vi.fn(),
    },
  };

  beforeEach(() => {
    service = new StatisticsService(mockPrisma as unknown as PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should calculate income, expense, and balance excluding transfers', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { type: CategoryType.INCOME, amount: 5000000 },
        { type: CategoryType.EXPENSE, amount: 1500000 },
        { type: CategoryType.EXPENSE, amount: 500000 },
      ]);

      const result = await service.getDashboard(10, 2026);
      expect(result).toEqual({
        income: 5000000,
        expense: 2000000,
        balance: 3000000,
      });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should group transactions by category and sort descending by total', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { categoryId: 'c1', amount: 300000, category: { name: 'Food' } },
        { categoryId: 'c1', amount: 200000, category: { name: 'Food' } },
        { categoryId: 'c2', amount: 150000, category: { name: 'Transport' } },
      ]);

      const result = await service.getCategories(10, 2026, CategoryType.EXPENSE);
      expect(result).toEqual([
        { id: 'c1', name: 'Food', total: 500000 },
        { id: 'c2', name: 'Transport', total: 150000 },
      ]);
    });
  });
});
