import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CategoryService } from './category.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryType } from '@prisma/client';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      count: vi.fn(),
      createMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    prisma = mockPrisma as unknown as PrismaService;
    service = new CategoryService(prisma);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Food', type: CategoryType.EXPENSE },
        { id: '2', name: 'Salary', type: CategoryType.INCOME },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();
      expect(result).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category when found', async () => {
      const mockCategory = { id: '1', name: 'Food', type: CategoryType.EXPENSE };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const dto = { name: 'Gym', type: CategoryType.EXPENSE, icon: 'barbell-outline' };
      const created = { id: '3', ...dto };
      mockPrisma.category.create.mockResolvedValue(created);

      const result = await service.create(dto);
      expect(result).toEqual(created);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: dto });
    });
  });
});
