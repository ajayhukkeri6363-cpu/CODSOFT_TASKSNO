import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            status: true,
          },
        },
        reservations: {
          select: {
            id: true,
            reservationDate: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerSummaries = customers.map((c) => {
      const totalOrders = c.orders.length;
      const lifetimeSpend = c.orders.reduce((sum, o) => sum + o.total, 0);
      const totalReservations = c.reservations.length;
      const lastOrder = c.orders.length > 0 ? c.orders[0].createdAt : null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        createdAt: c.createdAt,
        totalOrders,
        lifetimeSpend: Number(lifetimeSpend.toFixed(2)),
        totalReservations,
        lastOrder,
      };
    });

    return NextResponse.json({ customers: customerSummaries });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
