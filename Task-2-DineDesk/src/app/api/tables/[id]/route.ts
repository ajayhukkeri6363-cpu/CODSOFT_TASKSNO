import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

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
    const { tableNumber, capacity, location, status } = body;

    const table = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: {
        ...(tableNumber && { tableNumber: tableNumber.trim() }),
        ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
        ...(location && { location }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ table, message: 'Table updated successfully' });
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['ADMIN', 'STAFF']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ table, message: `Table status updated to ${status}` });
  } catch (error) {
    console.error('Error updating table status:', error);
    return NextResponse.json({ error: 'Failed to update table status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['ADMIN']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await prisma.restaurantTable.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
