import os

os.makedirs('src/statistics', exist_ok=True)

files = {
    'src/statistics/statistics.module.ts': '''import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service.js';
import { StatisticsController } from './statistics.controller.js';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
''',

    'src/statistics/statistics.controller.ts': '''import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get total income, expense, and balance' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getDashboard(@Query('month') month?: string, @Query('year') year?: string) {
    return this.statisticsService.getDashboard(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get expense grouped by category' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getCategories(@Query('month') month?: string, @Query('year') year?: string) {
    return this.statisticsService.getCategories(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get financial trend' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getTrend(@Query('year') year?: string) {
    return this.statisticsService.getTrend(year ? Number(year) : undefined);
  }
}
''',

    'src/statistics/statistics.service.ts': '''import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoryType } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  private getDateFilter(month?: number, year?: number) {
    if (!year) year = new Date().getFullYear();
    if (!month) {
      // Entire year
      return {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }
    // Specific month (1-indexed input to 0-indexed Date)
    return {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  async getDashboard(month?: number, year?: number) {
    const dateFilter = this.getDateFilter(month, year);
    
    const transactions = await this.prisma.transaction.findMany({
      where: { transactionDate: dateFilter },
      select: { type: true, amount: true },
    });

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === CategoryType.INCOME) income += t.amount;
      else expense += t.amount;
    });

    return { income, expense, balance: income - expense };
  }

  async getCategories(month?: number, year?: number) {
    const dateFilter = this.getDateFilter(month, year);
    
    const transactions = await this.prisma.transaction.findMany({
      where: { 
        transactionDate: dateFilter,
        type: CategoryType.EXPENSE 
      },
      include: { category: true },
    });

    const categoryMap = new Map<string, { id: string, name: string, total: number, color?: string }>();
    
    transactions.forEach(t => {
      const catId = t.categoryId;
      const catName = t.category?.name || 'Uncategorized';
      
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { id: catId, name: catName, total: 0 });
      }
      categoryMap.get(catId)!.total += t.amount;
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  }

  async getTrend(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const dateFilter = {
      gte: new Date(targetYear, 0, 1),
      lt: new Date(targetYear + 1, 0, 1),
    };

    const transactions = await this.prisma.transaction.findMany({
      where: { transactionDate: dateFilter },
      select: { type: true, amount: true, transactionDate: true },
    });

    // Initialize 12 months
    const trend = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    transactions.forEach(t => {
      const m = t.transactionDate.getMonth();
      if (t.type === CategoryType.INCOME) trend[m].income += t.amount;
      else trend[m].expense += t.amount;
    });

    return trend;
  }
}
'''
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Created Statistics Module")
