import os

os.makedirs('src/transaction/dto', exist_ok=True)

files = {
    'src/transaction/dto/create-transaction.dto.ts': '''import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { CategoryType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'b0e9c9c3-...' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: CategoryType, example: CategoryType.EXPENSE })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'Makan siang' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-10-05T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  transactionDate: string;
}
''',
    
    'src/transaction/dto/update-transaction.dto.ts': '''import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto.js';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
''',

    'src/transaction/transaction.service.ts': '''import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    // Convert transactionDate from string to Date
    return this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        transactionDate: new Date(createTransactionDto.transactionDate),
      },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      include: { category: true } // Include relation
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id); // Check existence
    
    // Prepare update data
    const data: any = { ...updateTransactionDto };
    if (updateTransactionDto.transactionDate) {
      data.transactionDate = new Date(updateTransactionDto.transactionDate);
    }

    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
''',

    'src/transaction/transaction.controller.ts': '''import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  findAll() {
    return this.transactionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
''',

    'src/transaction/transaction.module.ts': '''import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { TransactionController } from './transaction.controller.js';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
'''
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Created Transaction CRUD")
