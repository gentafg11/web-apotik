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
    const { items, total, paymentMethod, notes } = req.body;
    if (!items || !total) {
      return res.status(400).json({ message: 'Items and total required' });
    }

    // Use transaction to replace items
    const result = await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { saleId: Number(id) } });
      const sale = await tx.sale.update({
        where: { id: Number(id) },
        data: {
          total: Number(total),
          paymentMethod,
          notes,
          items: {
            create: items.map((item: any) => ({
              productId: Number(item.productId),
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          },
        },
        include: { items: true },
      });
      return sale;
    });

    return res.status(200).json(result);
  }

  if (req.method === 'DELETE') {
    await prisma.sale.delete({ where: { id: Number(id) } });
    return res.status(204).send(null);
  }

  res.status(405).json({ message: 'Method not allowed' });
}