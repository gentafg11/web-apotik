import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = d.getDate() - day; // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const { date } = req.query; // date is any day within the week
  const refDate = date ? new Date(date as string) : new Date();
  const start = startOfWeek(refDate);
  const end = endOfWeek(refDate);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { totalAmount: true },
  });
  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { amount: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return res.status(200).json({
    weekStart: start.toISOString().split('T')[0],
    weekEnd: end.toISOString().split('T')[0],
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
  });
}