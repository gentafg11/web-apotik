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

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
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

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const refDate = dateParam ? new Date(dateParam) : new Date();
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

  return NextResponse.json({
    weekStart: start.toISOString().split('T')[0],
    weekEnd: end.toISOString().split('T')[0],
    totalSales,
    totalExpenses,
    netProfit: totalSales - totalExpenses,
  });
}