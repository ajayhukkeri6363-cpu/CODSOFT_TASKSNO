import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: { table: true, user: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const body = await request.json();
    const { status, tableId, specialRequests } = body;

    const reservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(tableId !== undefined && { tableId }),
        ...(specialRequests !== undefined && { specialRequests }),
      },
      include: { table: true },
    });

    return NextResponse.json({ reservation, message: 'Reservation updated successfully' });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    await prisma.reservation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
