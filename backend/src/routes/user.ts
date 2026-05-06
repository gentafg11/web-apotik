import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all users (admin only)
router.get('/', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

// GET user by id (admin only)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: { id: true, email: true, role: true, createdAt: true }
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// CREATE user (admin only) – password will be hashed
router.post('/', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { email, password, role } = req.body as { email: string; password: string; role: Role };
  const hashed = await bcrypt.hash(password, 10);
  try {
    const newUser = await prisma.user.create({
      data: { email, password: hashed, role },
      select: { id: true, email: true, role: true, createdAt: true }
    });
    res.status(201).json(newUser);
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

// UPDATE user (admin only) – optional password change
router.put('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  const { email, password, role } = req.body as { email?: string; password?: string; role?: Role };
  const data: any = {};
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);
  try {
    const updated = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data,
      select: { id: true, email: true, role: true, createdAt: true }
    });
    res.json(updated);
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE user (admin only)
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
