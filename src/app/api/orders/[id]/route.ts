import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
      include: {
        table: true,
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer can only view own order unless staff/admin
    if (user && user.role === 'CUSTOMER' && order.userId && order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Kitchen/Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { status, estimatedPrepMin } = body;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(estimatedPrepMin !== undefined && { estimatedPrepMin: parseInt(estimatedPrepMin, 10) }),
      },
      include: {
        table: true,
        items: {
          include: { menuItem: true },
        },
        payment: true,
      },
    });

    // If order is completed or cancelled and table is assigned, free table to CLEANING or AVAILABLE
    if ((status === 'COMPLETED' || status === 'CANCELLED') && order.tableId) {
      await prisma.restaurantTable.update({
        where: { id: order.tableId },
        data: { status: status === 'COMPLETED' ? 'CLEANING' : 'AVAILABLE' },
      }).catch(() => null);
    }

    return NextResponse.json({ order, message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
