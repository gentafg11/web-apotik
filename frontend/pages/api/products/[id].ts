import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid product id' });

  const productId = Number(id);

  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.status(200).json(product);
  }

  // Admin only for PUT and DELETE
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'PUT') {
    const { name, price, imageUrl, sku, cost, stock } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (price !== undefined) updates.price = Number(price);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (sku) updates.sku = sku;
    if (cost !== undefined) updates.cost = Number(cost);
    if (stock !== undefined) updates.stock = Number(stock);

    try {
      const product = await prisma.product.update({
        where: { id: productId },
        data: updates,
      });
      return res.status(200).json(product);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'SKU already exists' });
      }
      throw error;
    }
  }

  if (req.method === 'DELETE') {
    await prisma.product.delete({ where: { id: productId } });
    return res.status(204).send(null);
  }

  res.status(405).json({ message: 'Method not allowed' });
}
