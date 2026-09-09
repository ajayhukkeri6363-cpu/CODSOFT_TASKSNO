import { NextResponse } from 'next/server';
import { seedCareerHubData } from '@/lib/seed';

async function handleSeed(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    // In production, require key if specified or allow initial seed
    if (process.env.NODE_ENV === 'production' && key && key !== 'careerhub_seed_2026') {
      return NextResponse.json({ error: 'Unauthorized seed trigger' }, { status: 403 });
    }

    await seedCareerHubData();
    return NextResponse.json({
      success: true,
      message: 'CareerHub database successfully seeded with all realistic demo data',
    });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: error.message || 'Seeding failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleSeed(req);
}

export async function POST(req: Request) {
  return handleSeed(req);
}
