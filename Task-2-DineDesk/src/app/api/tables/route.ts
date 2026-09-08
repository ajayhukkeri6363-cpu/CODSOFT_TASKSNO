import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const status = searchParams.get('status');

    const where: any = {};
    if (location) where.location = location;
    if (status) where.status = status;

    const tables = await prisma.restaurantTable.findMany({
      where,
      orderBy: { tableNumber: 'asc' },
      include: {
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] },
          },
          orderBy: { reservationDate: 'asc' },
          take: 2,
        },
        orders: {
          where: {
            status: { in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'] },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const body = await request.json();
    const { tableNumber, capacity, location, status } = body;

    if (!tableNumber || !capacity) {
      return NextResponse.json({ error: 'Table number and capacity are required' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: tableNumber.trim(),
        capacity: parseInt(capacity, 10),
        location: location || 'MAIN_HALL',
        status: status || 'AVAILABLE',
      },
    });

    return NextResponse.json({ table, message: 'Table created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A table with this number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
