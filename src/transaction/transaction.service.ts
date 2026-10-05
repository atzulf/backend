import { Injectable, NotFoundException } from '@nestjs/common';
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
