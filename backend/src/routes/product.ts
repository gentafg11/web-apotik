import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Multer config – store in public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniq = Date.now() + '-' + file.originalname;
    cb(null, uniq);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// CREATE
router.post('/', upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { name, sku, price, cost, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  try {
    const product = await prisma.product.create({
      data: { name, sku, price: Number(price), cost: Number(cost), stock: Number(stock), imageUrl }
    });
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: (e as any).message });
  }
});

// READ all
router.get('/', async (req: Request, res: Response) => {
  const products = await prisma.product.findMany({});
  res.json(products);
});

// READ one
router.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

// UPDATE
router.put('/:id', upload.single('image'), async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { name, sku, price, cost, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  const data: any = { name, sku, price: Number(price), cost: Number(cost), stock: Number(stock) };
  if (imageUrl) data.imageUrl = imageUrl;
  try {
    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: (e as any).message });
  }
});

// DELETE
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

export default router;
