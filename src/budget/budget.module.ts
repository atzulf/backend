import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service.js';
import { BudgetController } from './budget.controller.js';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
