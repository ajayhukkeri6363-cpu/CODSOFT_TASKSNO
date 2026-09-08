import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const result = await seedDatabase(force);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let force = false;
    try {
      const body = await request.json();
      force = !!body.force;
    } catch (e) {
      // Body empty or not JSON
    }

    const result = await seedDatabase(force);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Seed API POST error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}
