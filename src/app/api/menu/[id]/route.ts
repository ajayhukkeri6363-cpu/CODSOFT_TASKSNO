import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(['ADMIN']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      categoryId,
      name,
      description,
      price,
      image,
      isVeg,
      isGlutenFree,
      isSpicy,
      isPopular,
      isAvailable,
      prepTimeMinutes,
      calories,
      ingredients,
    } = body;

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(categoryId && { categoryId }),
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(image && { image }),
        ...(isVeg !== undefined && { isVeg: Boolean(isVeg) }),
        ...(isGlutenFree !== undefined && { isGlutenFree: Boolean(isGlutenFree) }),
        ...(isSpicy !== undefined && { isSpicy: Boolean(isSpicy) }),
        ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes: parseInt(prepTimeMinutes, 10) }),
        ...(calories !== undefined && { calories: calories ? parseInt(calories, 10) : null }),
        ...(ingredients !== undefined && { ingredients: ingredients ? ingredients.trim() : null }),
      },
      include: { category: true },
    });

    return NextResponse.json({ item, message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
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
    const { isAvailable } = body;

    if (isAvailable === undefined) {
      return NextResponse.json({ error: 'isAvailable is required' }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    return NextResponse.json({ item, message: `Dish marked as ${item.isAvailable ? 'Available' : 'Sold Out'}` });
  } catch (error) {
    console.error('Error toggling availability:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
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

    await prisma.menuItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
