import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const method = searchParams.get('method');
    const status = searchParams.get('status');

    const where: any = {};
    if (method) where.paymentMethod = method;
    if (status) where.status = status;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            orderType: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCollected = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      totalCollected: Number(totalCollected.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
