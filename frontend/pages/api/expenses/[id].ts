import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid expense id' });

  if (req.method === 'GET') {
    const expense = await prisma.expense.findUnique({ where: { id: Number(id) } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Check ownership if not admin
    const authResult = verifyToken(req);
    if ('error' in authResult) return res.status(401).json({ message: authResult.error });
    if (authResult.user.role !== 'ADMIN' && expense.userId !== authResult.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(expense);
  }

  // For PUT and DELETE, only admin
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'PUT') {
    const { amount, description } = req.body;
    const updates: any = {};
    if (amount !== undefined) updates.amount = Number(amount);
    if (description !== undefined) updates.description = description;
    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: updates,
    });
    return res.status(200).json(expense);
  }

  if (req.method === 'DELETE') {
    await prisma.expense.delete({ where: { id: Number(id) } });
    return res.status(204).send(null);
  }

  res.status(405).json({ message: 'Method not allowed' });
}