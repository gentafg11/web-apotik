import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return res.status(200).json(users);
  }

  if (req.method === 'POST') {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, role: role || 'CASHIER' },
    });
    return res.status(201).json({ id: user.id, email: user.email, role: user.role });
  }

  res.status(405).json({ message: 'Method not allowed' });
}