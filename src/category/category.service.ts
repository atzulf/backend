import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CategoryType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  // Seed default categories (PRD §15) when the table is empty
  async onModuleInit() {
    const count = await this.prisma.category.count();
    if (count > 0) return;

    const income = ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Other'];
    const expense = [
      'Food', 'Transportation', 'Housing', 'Bills', 'Shopping',
      'Entertainment', 'Health', 'Education', 'Subscription', 'Other',
    ];

    await this.prisma.category.createMany({
      data: [
        ...income.map((name) => ({ name, type: CategoryType.INCOME })),
        ...expense.map((name) => ({ name, type: CategoryType.EXPENSE })),
      ],
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id); // Check existence
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
