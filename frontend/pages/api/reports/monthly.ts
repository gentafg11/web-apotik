import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfMonth(date: Date) {
  const d = new Date(date);
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const end = new Date(nextMonth.getTime() - 1);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  const { month, year } = req.query; // month: 1-12, year: YYYY
  const now = new Date();
  const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1;
  const targetYear = year ? parseInt(year as string) : now.getFullYear();

  const start = startOfMonth(new Date(targetYear, targetMonth - 1, 1));
  const end = endOfMonth(new Date(targetYear, targetMonth - 1, 1));

  const sales = await prisma.sale.findMany({
    where: { date: { gte: start, lte: end } },
    select: { total: true },
  });
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: start, lte: end } },
    select: { amount: true },
  });

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return res.status(200).json({
    month: targetMonth,
    year: targetYear,
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
  });
}