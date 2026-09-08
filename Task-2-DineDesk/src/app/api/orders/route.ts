import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { calculateOrderTotals } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderType = searchParams.get('orderType');
    const customerId = searchParams.get('customerId');
    const limit = searchParams.get('limit');

    const where: any = {};

    // Customer can only view own orders
    if (user?.role === 'CUSTOMER') {
      where.OR = [
        { userId: user.id },
        { customerEmail: user.email },
      ];
    } else if (customerId) {
      where.userId = customerId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (orderType && orderType !== 'ALL') {
      where.orderType = orderType;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        items: {
          include: {
            menuItem: true,
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
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit, 10) }),
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      items,
      orderType,
      tableId,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      couponCode,
      paymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty. Please add items to place an order.' }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer name and phone number are required.' }, { status: 400 });
    }

    if (orderType === 'DINE_IN' && !tableId) {
      return NextResponse.json({ error: 'Please select a dining table for Dine-in orders.' }, { status: 400 });
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      return NextResponse.json({ error: 'Please provide a delivery address for Delivery orders.' }, { status: 400 });
    }

    // Fetch verified menu items from database
    const itemIds = items.map((i: any) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemIds } },
    });

    if (dbMenuItems.length !== itemIds.length) {
      return NextResponse.json({ error: 'One or more items in your cart are no longer available.' }, { status: 400 });
    }

    // Calculate subtotal from verified prices
    let itemsSubtotal = 0;
    let maxPrepTime = 15;
    const orderItemsData = [];

    for (const item of items) {
      const dbItem = dbMenuItems.find((m) => m.id === item.menuItemId);
      if (!dbItem || !dbItem.isAvailable) {
        return NextResponse.json({ error: `Dish "${item.name || 'item'}" is currently sold out.` }, { status: 400 });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      const lineTotal = Number((dbItem.price * qty).toFixed(2));
      itemsSubtotal += lineTotal;

      if (dbItem.prepTimeMinutes > maxPrepTime) {
        maxPrepTime = dbItem.prepTimeMinutes;
      }

      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: qty,
        unitPrice: dbItem.price,
        totalPrice: lineTotal,
        specialInstructions: item.specialInstructions ? item.specialInstructions.trim() : null,
      });
    }

    // Discount validation
    let discount = 0;
    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      if (cleanCoupon === 'DINE10') {
        discount = Number((itemsSubtotal * 0.1).toFixed(2));
      } else if (cleanCoupon === 'TASTY20') {
        discount = Number((itemsSubtotal * 0.2).toFixed(2));
      }
    }

    const { subtotal, tax, deliveryFee, total } = calculateOrderTotals(
      itemsSubtotal,
      orderType || 'DINE_IN',
      discount
    );

    const orderNumber = `ORD-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    // Create Order with nested items and payment transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user?.id || null,
        tableId: orderType === 'DINE_IN' ? tableId : null,
        customerName: customerName.trim(),
        customerEmail: customerEmail ? customerEmail.toLowerCase().trim() : user?.email || '',
        customerPhone: customerPhone.trim(),
        orderType: orderType || 'DINE_IN',
        status: 'PLACED',
        subtotal,
        tax,
        deliveryFee,
        discount,
        total,
        notes: notes ? notes.trim() : null,
        deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
        estimatedPrepMin: maxPrepTime + (orderType === 'DELIVERY' ? 15 : 5),
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
            amount: total,
            paymentMethod: paymentMethod || 'ONLINE',
            status: paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
            paidAt: paymentMethod === 'CASH' ? null : new Date(),
          },
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
        payment: true,
        table: true,
      },
    });

    // If dine in, mark table as OCCUPIED
    if (orderType === 'DINE_IN' && tableId) {
      await prisma.restaurantTable.update({
        where: { id: tableId },
        data: { status: 'OCCUPIED' },
      }).catch(() => null);
    }

    return NextResponse.json(
      {
        order,
        message: 'Order placed successfully! The kitchen is preparing your ticket.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
