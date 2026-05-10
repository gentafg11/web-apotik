import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid sale id' });

  // Only admin can update/delete
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'PUT') {
    const { items, totalAmount } = req.body;
    if (!items || totalAmount === undefined) {
      return res.status(400).json({ message: 'Items and totalAmount required' });
    }

    // Use transaction to replace items
    // Hitung totalAmount jika tidak dikirim oleh frontend
    const finalTotal = totalAmount !== undefined
      ? Number(totalAmount)
      : items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);
    });

    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    await prisma.sale.delete({ where: { id: Number(id) } });
    return res.status(204).send(null);
  }

  res.status(405).json({ message: 'Method not allowed' });
}