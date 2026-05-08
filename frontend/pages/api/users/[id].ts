import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid user id' });

  const authResult = verifyToken(req);
  if ('error' in authResult) return res.status(401).json({ message: authResult.error });
  if (authResult.user.role !== 'ADMIN') return res.status(403).json({ message: 'Forbidden' });

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json(user);
  }

  if (req.method === 'PUT') {
    const { email, password, role } = req.body;
    const updates: any = {};
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: updates,
      select: { id: true, email: true, role: true, createdAt: true },
    });
    return res.status(200).json(user);
  }

  if (req.method === 'DELETE') {
    if (id === '1') return res.status(403).json({ message: 'Cannot delete superadmin' });
    await prisma.user.delete({ where: { id: Number(id) } });
    return res.status(204).send(null);
  }

  res.status(405).json({ message: 'Method not allowed' });
}