import { NextRequest, NextResponse } from 'next/server';
import { getExperimentWithResponses } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';
    
    const experiment = getExperimentWithResponses(id);
    
    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      );
    }
    
    if (format === 'csv') {
      const csv = convertToCSV(experiment);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="experiment-${id}.csv"`,
        },
      });
    } else {
      // JSON format
      const json = JSON.stringify(experiment, null, 2);
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="experiment-${id}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Export experiment error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to export experiment', message },
      { status: 500 }
    );
  }
}

interface ExperimentData {
  id: string;
  prompt: string;
  created_at: string;
  responses: Array<{
    id: string;
    temperature: number;
    top_p: number;
    content: string;
    metrics: {
      coherence: { score: number; explanation: string };
      lexicalDiversity: { score: number; explanation: string };
      completeness: { score: number; explanation: string };
      readability: { score: number; explanation: string };
      lengthAppropriate: { score: number; explanation: string };
      overallScore: number;
    };
    created_at: string;
  }>;
}

function convertToCSV(experiment: ExperimentData): string {
  const headers = [
    'Response ID',
    'Temperature',
    'Top P',
    'Content',
    'Overall Score',
    'Coherence Score',
    'Coherence Explanation',
    'Lexical Diversity Score',
    'Lexical Diversity Explanation',
    'Completeness Score',
    'Completeness Explanation',
    'Readability Score',
    'Readability Explanation',
    'Length Appropriateness Score',
    'Length Appropriateness Explanation',
    'Created At',
  ];
  
  const rows = experiment.responses.map((response) => [
    response.id,
    response.temperature,
    response.top_p,
    `"${response.content.replace(/"/g, '""')}"`, // Escape quotes in CSV
    response.metrics.overallScore,
    response.metrics.coherence.score,
    `"${response.metrics.coherence.explanation.replace(/"/g, '""')}"`,
    response.metrics.lexicalDiversity.score,
    `"${response.metrics.lexicalDiversity.explanation.replace(/"/g, '""')}"`,
    response.metrics.completeness.score,
    `"${response.metrics.completeness.explanation.replace(/"/g, '""')}"`,
    response.metrics.readability.score,
    `"${response.metrics.readability.explanation.replace(/"/g, '""')}"`,
    response.metrics.lengthAppropriate.score,
    `"${response.metrics.lengthAppropriate.explanation.replace(/"/g, '""')}"`,
    response.created_at,
  ]);
  
  const csvContent = [
    `Experiment: ${experiment.prompt}`,
    `Created: ${experiment.created_at}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
  
  return csvContent;
}

