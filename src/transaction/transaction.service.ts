import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { QueryTransactionDto } from './dto/query-transaction.dto.js';
import { TransferDto } from './dto/transfer.dto.js';

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

  async transfer(transferDto: TransferDto) {
    const cleanNote = transferDto.description?.trim();
    const noteSuffix = cleanNote ? ` (${cleanNote})` : '';

    return this.prisma.$transaction(async (tx) => {
      const outTx = await tx.transaction.create({
        data: {
          categoryId: transferDto.sourceCategoryId,
          type: 'EXPENSE',
          amount: transferDto.amount,
          description: `Transfer ke Dompet ${transferDto.targetCategoryName}${noteSuffix}`,
          transactionDate: new Date(transferDto.transactionDate),
        },
        include: { category: true },
      });

      const inTx = await tx.transaction.create({
        data: {
          categoryId: transferDto.targetCategoryId,
          type: 'INCOME',
          amount: transferDto.amount,
          description: `Transfer dari Dompet ${transferDto.sourceCategoryName}${noteSuffix}`,
          transactionDate: new Date(transferDto.transactionDate),
        },
        include: { category: true },
      });

      return { outTx, inTx };
    });
  }

  async findAll(query: QueryTransactionDto = {}) {
    const { type, categoryId, startDate, endDate } = query;

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        // Make endDate inclusive (until end of that day)
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    return this.prisma.transaction.findMany({
      where: {
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(dateFilter && { transactionDate: dateFilter }),
      },
      orderBy: [
        { transactionDate: 'desc' },
        { createdAt: 'desc' }
      ],
      include: { category: true },
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
