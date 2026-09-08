import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const where: any = {};

    // If customer, only see own reservations
    if (user?.role === 'CUSTOMER') {
      where.OR = [
        { userId: user.id },
        { customerEmail: user.email },
      ];
    } else if (customerId) {
      where.userId = customerId;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      where.reservationDate = {
        gte: searchDate,
        lt: nextDay,
      };
    }

    if (status) {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [{ reservationDate: 'desc' }, { timeSlot: 'asc' }],
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      reservationDate,
      timeSlot,
      guestCount,
      tableId,
      specialRequests,
      locationPreference,
    } = body;

    if (!customerName || !customerPhone || !reservationDate || !timeSlot || !guestCount) {
      return NextResponse.json(
        { error: 'Name, phone, reservation date, time slot, and guest count are required.' },
        { status: 400 }
      );
    }

    const bookingDate = new Date(reservationDate);
    const dayStart = new Date(bookingDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(bookingDate);
    dayEnd.setHours(23, 59, 59, 999);

    let assignedTableId = tableId;

    // If no specific table requested, find best fitting available table
    if (!assignedTableId) {
      const tables = await prisma.restaurantTable.findMany({
        where: {
          capacity: { gte: parseInt(guestCount, 10) },
          ...(locationPreference && { location: locationPreference }),
        },
        include: {
          reservations: {
            where: {
              reservationDate: { gte: dayStart, lte: dayEnd },
              timeSlot: timeSlot,
              status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
            },
          },
        },
        orderBy: { capacity: 'asc' },
      });

      const freeTable = tables.find((t) => t.reservations.length === 0);
      if (freeTable) {
        assignedTableId = freeTable.id;
      }
    } else {
      // Check for collision on the requested table
      const conflict = await prisma.reservation.findFirst({
        where: {
          tableId: assignedTableId,
          reservationDate: { gte: dayStart, lte: dayEnd },
          timeSlot: timeSlot,
          status: { in: ['CONFIRMED', 'PENDING', 'SEATED'] },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: `Table is already reserved for ${timeSlot} on this date. Please pick another time slot or table.` },
          { status: 409 }
        );
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: user?.id || null,
        tableId: assignedTableId || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : user?.email || '',
        customerPhone: customerPhone.trim(),
        reservationDate: bookingDate,
        timeSlot: timeSlot.trim(),
        guestCount: parseInt(guestCount, 10),
        specialRequests: specialRequests ? specialRequests.trim() : null,
        status: 'CONFIRMED',
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(
      {
        reservation,
        message: 'Table reserved successfully! A confirmation voucher has been generated.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
