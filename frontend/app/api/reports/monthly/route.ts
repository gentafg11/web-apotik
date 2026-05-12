import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

function getAuthUser(request: Request): { userId: number; role: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

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

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  const now = new Date();
  const targetMonth = monthParam ? parseInt(monthParam) : now.getMonth() + 1;
  const targetYear = yearParam ? parseInt(yearParam) : now.getFullYear();

  const start = startOfMonth(new Date(targetYear, targetMonth - 1, 1));
  const end = endOfMonth(new Date(targetYear, targetMonth - 1, 1));

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

  return NextResponse.json({
    month: targetMonth,
    year: targetYear,
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
  });
}