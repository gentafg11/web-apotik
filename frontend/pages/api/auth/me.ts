import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = verifyToken(req);
  if ('error' in authResult) {
    return res.status(401).json({ message: authResult.error });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}