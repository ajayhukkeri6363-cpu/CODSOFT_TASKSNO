import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth(['ADMIN']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, icon, displayOrder } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const category = await prisma.menuCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description ? description.trim() : null,
        icon: icon || 'Utensils',
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
      },
    });

    return NextResponse.json({ category, message: 'Category created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
