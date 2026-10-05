import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BudgetService } from './budget.service.js';
import { CreateBudgetDto } from './dto/create-budget.dto.js';
import { UpdateBudgetDto } from './dto/update-budget.dto.js';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Budgets')
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetService.create(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets, optionally filter by month and year' })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  findAll(@Query('month') month?: string, @Query('year') year?: string) {
    return this.budgetService.findAll(month ? Number(month) : undefined, year ? Number(year) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetService.remove(id);
  }
}
