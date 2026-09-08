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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      ordersWithTotals,
      todayOrdersWithTotals,
      pendingOrdersCount,
      activeReservationsCount,
      tables,
      orderItems,
      allOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.findMany({ select: { total: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: todayStart } }, select: { total: true } }),
      prisma.order.count({ where: { status: { in: ['PLACED', 'CONFIRMED', 'PREPARING'] } } }),
      prisma.reservation.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'SEATED'] } } }),
      prisma.restaurantTable.findMany(),
      prisma.orderItem.findMany({
        include: { menuItem: true },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          status: true,
          orderType: true,
          total: true,
          createdAt: true,
        },
      }),
    ]);

    const grossRevenue = ordersWithTotals.reduce((sum, o) => sum + o.total, 0);
    const todayRevenue = todayOrdersWithTotals.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;

    const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'RESERVED').length;
    const availableTables = tables.filter((t) => t.status === 'AVAILABLE').length;
    const occupancyRate = tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0;

    // Calculate Top Selling Dishes
    const dishMap: { [id: string]: { name: string; quantity: number; revenue: number; image: string; category: string } } = {};
    for (const item of orderItems) {
      if (!dishMap[item.menuItemId]) {
        dishMap[item.menuItemId] = {
          name: item.menuItem.name,
          quantity: 0,
          revenue: 0,
          image: item.menuItem.image,
          category: item.menuItem.categoryId,
        };
      }
      dishMap[item.menuItemId].quantity += item.quantity;
      dishMap[item.menuItemId].revenue += item.totalPrice;
    }

    const topSellingDishes = Object.values(dishMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Orders by Type
    const ordersByType = [
      { name: 'Dine-In', value: allOrders.filter((o) => o.orderType === 'DINE_IN').length },
      { name: 'Takeaway', value: allOrders.filter((o) => o.orderType === 'TAKEAWAY').length },
      { name: 'Delivery', value: allOrders.filter((o) => o.orderType === 'DELIVERY').length },
    ];

    // Orders by Status
    const ordersByStatus = [
      { name: 'Placed', count: allOrders.filter((o) => o.status === 'PLACED').length },
      { name: 'Confirmed', count: allOrders.filter((o) => o.status === 'CONFIRMED').length },
      { name: 'Preparing', count: allOrders.filter((o) => o.status === 'PREPARING').length },
      { name: 'Ready', count: allOrders.filter((o) => o.status === 'READY').length },
      { name: 'Completed', count: allOrders.filter((o) => o.status === 'COMPLETED').length },
    ];

    return NextResponse.json({
      summary: {
        totalOrders,
        todayOrders,
        grossRevenue: Number(grossRevenue.toFixed(2)),
        todayRevenue: Number(todayRevenue.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        pendingOrdersCount,
        activeReservationsCount,
        totalTables: tables.length,
        availableTables,
        occupiedTables,
        occupancyRate,
      },
      topSellingDishes,
      ordersByType,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    return NextResponse.json({ error: 'Failed to compute analytics' }, { status: 500 });
  }
}
