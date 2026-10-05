import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const income = ['Salary', 'Freelance', 'Business', 'Investment', 'Bonus', 'Gift', 'Other'];
  const expense = [
    'Food', 'Transportation', 'Housing', 'Bills', 'Shopping',
    'Entertainment', 'Health', 'Education', 'Subscription', 'Other',
  ];

  for (const name of income) {
    const exists = await prisma.category.findFirst({ where: { name, type: 'INCOME' } });
    if (!exists) await prisma.category.create({ data: { name, type: 'INCOME' } });
  }

  for (const name of expense) {
    const exists = await prisma.category.findFirst({ where: { name, type: 'EXPENSE' } });
    if (!exists) await prisma.category.create({ data: { name, type: 'EXPENSE' } });
  }
}

main().then(() => console.log('Seeded missing categories')).catch(console.error);
