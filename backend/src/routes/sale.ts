import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// LIST sales (admin sees all, cashier sees only own)
router.get('/', async (req: AuthRequest, res: Response) => {
  const where = req.user?.role === 'ADMIN' ? {} : { userId: req.user?.id };
  const sales = await prisma.sale.findMany({
    where,
    include: { items: true, user: true }
  });
  res.json(sales);
});

// GET single sale
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const sale = await prisma.sale.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: true, user: true }
  });
  if (!sale) return res.status(404).json({ message: 'Sale not found' });
  // cashiers can only see their own sales
  if (req.user?.role !== 'ADMIN' && sale.userId !== req.user?.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(sale);
});

// CREATE a sale (cashier or admin)
router.post('/', async (req: AuthRequest, res: Response) => {
  const { items } = req.body as {
    items: { productId: number; qty: number; price: number }[];
  };
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  // calculate totalAmount
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const sale = await prisma.sale.create({
    data: {
      userId: req.user.id,
      totalAmount: total,
      items: { create: items.map(i => ({ productId: i.productId, qty: i.qty, price: i.price })) }
    },
    include: { items: true }
  });
  res.status(201).json(sale);
});

// UPDATE sale (admin only for simplicity)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { items, customerId } = req.body as {
    items?: { productId: number; qty: number; price: number }[];
    customerId?: number;
  };
  const saleId = Number(req.params.id);

  // Check if sale exists
  const existing = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!existing) return res.status(404).json({ message: 'Sale not found' });

  const updateData: any = {};
  if (customerId !== undefined) updateData.customerId = customerId;

  // If items are provided, replace sale items and recalc total
  if (items !== undefined) {
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    updateData.totalAmount = total;

    // Replace items in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.saleItem.deleteMany({ where: { saleId } });
      if (items.length > 0) {
        await tx.saleItem.createMany({
          data: items.map(i => ({
            saleId,
            productId: i.productId,
            qty: i.qty,
            price: i.price
          }))
        });
      }
    });
  }

  const updated = await prisma.sale.update({
    where: { id: saleId },
    data: updateData,
    include: { items: true }
  });
  res.json(updated);
});

// DELETE sale (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  await prisma.sale.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

export default router;
