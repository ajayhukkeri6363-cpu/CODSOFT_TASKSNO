import { NextResponse } from 'next/server';
import { seedCareerHubData } from '@/lib/seed';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    // In production, require key or admin
    if (process.env.NODE_ENV === 'production' && key !== 'careerhub_seed_2026') {
      return NextResponse.json({ error: 'Unauthorized seed trigger' }, { status: 403 });
    }

    await seedCareerHubData();
    return NextResponse.json({ message: 'CareerHub database successfully seeded' });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}
