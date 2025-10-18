import { NextRequest, NextResponse } from 'next/server';
import { getAllExperiments } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    
    const experiments = getAllExperiments(limit, offset);
    
    return NextResponse.json({
      experiments,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get experiments error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to retrieve experiments', message },
      { status: 500 }
    );
  }
}

