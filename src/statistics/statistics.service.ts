import { Injectable } from '@nestjs/common';
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

  async getTrend(year?: number, month?: number) {
    const targetYear = year || new Date().getFullYear();

    if (month) {
      // Daily trend for the specific month
      const daysInMonth = new Date(targetYear, month, 0).getDate();
      const dateFilter = {
        gte: new Date(targetYear, month - 1, 1),
        lt: new Date(targetYear, month, 1),
      };

      const transactions = await this.prisma.transaction.findMany({
        where: { transactionDate: dateFilter },
        select: { type: true, amount: true, transactionDate: true },
      });

      const trend = Array.from({ length: daysInMonth }, (_, i) => ({
        label: `${i + 1}`,
        income: 0,
        expense: 0,
      }));

      transactions.forEach(t => {
        const d = t.transactionDate.getDate();
        if (t.type === CategoryType.INCOME) trend[d - 1].income += t.amount;
        else trend[d - 1].expense += t.amount;
      });

      return trend;
    } else {
      // Monthly trend for the year
      const dateFilter = {
        gte: new Date(targetYear, 0, 1),
        lt: new Date(targetYear + 1, 0, 1),
      };

      const transactions = await this.prisma.transaction.findMany({
        where: { transactionDate: dateFilter },
        select: { type: true, amount: true, transactionDate: true },
      });

      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      const trend = Array.from({ length: 12 }, (_, i) => ({
        label: monthLabels[i],
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
}
