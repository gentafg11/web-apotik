import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  }

  // Only admin can create products
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'POST') {
    const { name, price, imageUrl, sku, cost, stock, supplierId } = req.body;
    if (!name || price === undefined || !sku || cost === undefined || stock === undefined || supplierId === undefined) {
      return res.status(400).json({ message: 'Missing required fields: name, price, sku, cost, stock, supplierId' });
    }
    try {
      const product = await prisma.product.create({
        data: {
          name,
          price: Number(price),
          imageUrl,
          sku,
          cost: Number(cost),
          stock: Number(stock),
          supplierId: Number(supplierId),
        },
      });
      return res.status(201).json(product);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'SKU already exists' });
      }
      throw error;
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
