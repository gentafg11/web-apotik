import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

export interface AuthUser {
  id: number;
  role: string;
}

export function verifyToken(req: NextApiRequest): { user: AuthUser } | { error: string } {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { error: 'Missing token' };
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    return { user: { id: payload.userId, role: payload.role } };
  } catch (err) {
    return { error: 'Invalid token' };
  }
}
