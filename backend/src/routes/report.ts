import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth, endOfDay } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

// Helper to aggregate sales & expenses between dates
async function aggregate(from: Date, to: Date) {
  const sales = await prisma.sale.aggregate({
    _sum: { totalAmount: true },
    where: { createdAt: { gte: from, lte: to } }
  });
  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { createdAt: { gte: from, lte: to } }
  });
  return {
    sales: Number(sales._sum.totalAmount ?? 0),
    expenses: Number(expenses._sum.amount ?? 0),
    profit: Number(sales._sum.totalAmount ?? 0) - Number(expenses._sum.amount ?? 0)
  };
}

router.get('/daily', async (req: Request, res: Response) => {
  const now = new Date();
  const from = startOfDay(now);
  const to = endOfDay(now);
  const data = await aggregate(from, to);
  res.json(data);
});

router.get('/weekly', async (req: Request, res: Response) => {
  const now = new Date();
  const from = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const to = endOfDay(now);
  const data = await aggregate(from, to);
  res.json(data);
});

router.get('/monthly', async (req: Request, res: Response) => {
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfDay(now);
  const data = await aggregate(from, to);
  res.json(data);
});

export default router;
