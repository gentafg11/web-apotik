import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

function getAuthUser(request: Request): { userId: number; role: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const where = user.role === 'ADMIN' ? {} : { userId: user.userId };
  const sales = await prisma.sale.findMany({
    where,
    include: { items: true, user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(sales);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { items, totalAmount } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'Items required' }, { status: 400 });
    }

    const finalTotal = totalAmount !== undefined
      ? Number(totalAmount)
      : items.reduce((sum: number, item: any) => sum + Number(item.qty) * Number(item.price), 0);

    const result = await prisma.sale.update({
      where: { id: Number(id) },
      data: {
        totalAmount: finalTotal,
        items: {
          deleteMany: { saleId: Number(id) },
          create: items.map((item: any) => ({
            productId: item.productId,
            qty: Number(item.qty),
            price: Number(item.price),
          })),
        },
      },
      include: { items: true },
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update sale' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.sale.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete sale' }, { status: 500 });
  }
}