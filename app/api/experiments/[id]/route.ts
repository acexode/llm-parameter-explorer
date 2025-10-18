import { NextRequest, NextResponse } from 'next/server';
import { getExperimentWithResponses, deleteExperiment } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const experiment = getExperimentWithResponses(id);
    
    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(experiment);
  } catch (error) {
    console.error('Get experiment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to retrieve experiment', message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    deleteExperiment(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete experiment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete experiment', message },
      { status: 500 }
    );
  }
}

