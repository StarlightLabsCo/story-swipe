import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

async function createWorld() {
  const world = await db.world.create({
    data: {},
  });

  return world;
}

export async function POST(request: NextRequest) {
  try {
    const result = await createWorld();
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    return new NextResponse(JSON.stringify({ success: false, message: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
