import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    // Check if budget already exists for this category, month and year
    const existing = await this.prisma.budget.findFirst({
      where: {
        categoryId: createBudgetDto.categoryId,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
      }
    });

    if (existing) {
      throw new BadRequestException('Budget for this category in this month already exists.');
    }

    return this.prisma.budget.create({
      data: createBudgetDto,
      include: { category: true }
    });
  }

  async findAll(month?: number, year?: number) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }]
    });

    // Augment with 'used' amount from transactions
    return Promise.all(budgets.map(async (b) => {
      const start = new Date(b.year, b.month - 1, 1);
      const end = new Date(b.year, b.month, 1);
      const agg = await this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          categoryId: b.categoryId,
          transactionDate: { gte: start, lt: end }
        }
      });
      return { ...b, used: agg._sum.amount || 0 };
    }));
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id);
    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.budget.delete({ where: { id } });
  }
}
