import os

os.makedirs('src/budget', exist_ok=True)
os.makedirs('src/budget/dto', exist_ok=True)

files = {
    'src/budget/dto/create-budget.dto.ts': '''import { IsInt, IsNotEmpty, IsPositive, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBudgetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  year: number;
}
''',

    'src/budget/dto/update-budget.dto.ts': '''import { PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto.js';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {}
''',

    'src/budget/budget.module.ts': '''import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service.js';
import { BudgetController } from './budget.controller.js';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
''',

    'src/budget/budget.controller.ts': '''import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BudgetService } from './budget.service.js';
import { CreateBudgetDto } from './create-budget.dto.js';
import { UpdateBudgetDto } from './update-budget.dto.js';
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
''',

    'src/budget/budget.service.ts': '''import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    return this.prisma.budget.findMany({
      where: {
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });
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
'''
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Created Budget Module")
