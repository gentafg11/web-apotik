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
    const sales = await prisma.sale.findMany({
      where,
      include: { items: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(sales);
  }

  // POST requires authenticated user
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });

  if (req.method === 'POST') {
    const { items, totalAmount } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    // Hitung totalAmount jika tidak dikirim oleh frontend
    const finalTotal = totalAmount !== undefined
      ? Number(totalAmount)
      : items.reduce((sum: number, item: any) => sum + Number(item.qty) * Number(item.price), 0);
    const sale = await prisma.sale.create({
      data: {
        userId: authResult.user.id,
        totalAmount: finalTotal,
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            qty: Number(item.qty),
            price: Number(item.price),
          })),
        },
      },
      include: { items: true },
    });
    return res.status(201).json(sale);
  }

  res.status(405).json({ message: 'Method not allowed' });
}