import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const search = searchParams.get('search');
    const isVeg = searchParams.get('isVeg');
    const isGlutenFree = searchParams.get('isGlutenFree');
    const isSpicy = searchParams.get('isSpicy');
    const isPopular = searchParams.get('isPopular');
    const isAvailable = searchParams.get('isAvailable');

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug && categorySlug !== 'all') {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { ingredients: { contains: search } },
      ];
    }

    if (isVeg === 'true') where.isVeg = true;
    if (isGlutenFree === 'true') where.isGlutenFree = true;
    if (isSpicy === 'true') where.isSpicy = true;
    if (isPopular === 'true') where.isPopular = true;
    if (isAvailable === 'true') where.isAvailable = true;

    const items = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!categoryId || !name || !description || price === undefined) {
      return NextResponse.json(
        { error: 'Category, name, description, and price are required.' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name: name.trim(),
        slug,
        description: description.trim(),
        price: parseFloat(price),
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        isVeg: Boolean(isVeg),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        isPopular: Boolean(isPopular),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : 15,
        calories: calories ? parseInt(calories, 10) : null,
        ingredients: ingredients ? ingredients.trim() : null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ item, message: 'Menu item created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
