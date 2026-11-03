import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BudgetService } from './budget.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('BudgetService', () => {
  let service: BudgetService;

  const mockPrisma = {
    budget: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn(),
    },
  };

  beforeEach(() => {
    service = new BudgetService(mockPrisma as unknown as PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return budgets augmented with used amount', async () => {
      mockPrisma.budget.findMany.mockResolvedValue([
        { id: 'b1', categoryId: 'c1', amount: 1000000, month: 10, year: 2026 },
      ]);
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 650000 },
      });

      const result = await service.findAll(10, 2026);
      expect(result).toEqual([
        { id: 'b1', categoryId: 'c1', amount: 1000000, month: 10, year: 2026, used: 650000 },
      ]);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if budget already exists for month/year', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue({ id: 'existing-b' });

      await expect(
        service.create({ categoryId: 'c1', amount: 500000, month: 10, year: 2026 }),
      ).rejects.toThrow();
    });

    it('should create budget when no duplicate exists', async () => {
      mockPrisma.budget.findFirst.mockResolvedValue(null);
      const newBudget = { id: 'b2', categoryId: 'c2', amount: 750000, month: 10, year: 2026 };
      mockPrisma.budget.create.mockResolvedValue(newBudget);

      const result = await service.create({ categoryId: 'c2', amount: 750000, month: 10, year: 2026 });
      expect(result).toEqual(newBudget);
    });
  });
});
