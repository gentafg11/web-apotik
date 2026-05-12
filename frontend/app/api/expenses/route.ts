import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';

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

export async function GET(request: Request) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const where = user.role === 'ADMIN' ? {} : { userId: user.userId };
  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(expenses);
}

export async function POST(request: Request) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { description, amount } = body;

    if (!description || amount === undefined) {
      return NextResponse.json({ message: 'Description and amount required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: Number(amount),
        userId: user.userId,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create expense' }, { status: 500 });
  }
}