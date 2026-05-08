import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const { date } = req.query;
  const targetDate = date ? new Date(date as string) : new Date();
  const start = startOfDay(targetDate);
  const end = endOfDay(targetDate);

  const sales = await prisma.sale.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    select: { total: true },
  });
  const expenses = await prisma.expense.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    select: { amount: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return res.status(200).json({
    date: targetDate.toISOString().split('T')[0],
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
  });
}