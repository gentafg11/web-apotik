import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const authResult = verifyToken(req);
    if ('error' in authResult) return res.status(401).json({ message: authResult.error });
    const userId = authResult.user.id;
    const role = authResult.user.role;

    const where = role === 'ADMIN' ? {} : { userId };
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    return res.status(200).json(expenses);
  }

  // POST requires authenticated
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });

  if (req.method === 'POST') {
    const { amount, category, description, date } = req.body;
    if (amount === undefined) {
      return res.status(400).json({ message: 'Amount required' });
    }
    const expense = await prisma.expense.create({
      data: {
        userId: authResult.user.id,
        amount: Number(amount),
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });
    return res.status(201).json(expense);
  }

  res.status(405).json({ message: 'Method not allowed' });
}