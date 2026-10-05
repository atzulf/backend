import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoryModule } from './category/category.module.js';
import { TransactionModule } from './transaction/transaction.module.js';
import { StatisticsModule } from './statistics/statistics.module.js';
import { BudgetModule } from './budget/budget.module.js';

@Module({
  imports: [PrismaModule, CategoryModule, TransactionModule, StatisticsModule, BudgetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
