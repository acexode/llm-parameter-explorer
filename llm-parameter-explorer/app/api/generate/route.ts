import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createExperiment, createResponse } from '@/lib/db';
import { generateCompletion } from '@/lib/openai';
import { calculateQualityMetrics } from '@/lib/metrics';
import { GenerateRequest, GenerateResponse } from '@/types';

// Validation schema
const GenerateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(2000, 'Prompt too long'),
  temperatureMin: z.number().min(0).max(2),
  temperatureMax: z.number().min(0).max(2),
  topPMin: z.number().min(0).max(1),
  topPMax: z.number().min(0).max(1),
  variations: z.number().int().min(1).max(10),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = GenerateSchema.parse(body) as GenerateRequest;
    
    // Validate ranges
    if (validatedData.temperatureMin > validatedData.temperatureMax) {
      return NextResponse.json(
        { error: 'Temperature min cannot be greater than max' },
        { status: 400 }
      );
    }
    
    if (validatedData.topPMin > validatedData.topPMax) {
      return NextResponse.json(
        { error: 'Top P min cannot be greater than max' },
        { status: 400 }
      );
    }
    
    // Create experiment
    const experimentId = uuidv4();
    const experiment = createExperiment(experimentId, validatedData.prompt);
    
    // Generate parameter combinations
    const parameterCombinations = generateParameterCombinations(
      validatedData.temperatureMin,
      validatedData.temperatureMax,
      validatedData.topPMin,
      validatedData.topPMax,
      validatedData.variations
    );
    
    // Generate responses for each parameter combination
    const responses = await Promise.all(
      parameterCombinations.map(async ({ temperature, top_p }) => {
        try {
          // Generate completion from OpenAI
          const content = await generateCompletion({
            prompt: validatedData.prompt,
            temperature,
            top_p,
          });
          
          // Calculate quality metrics
          const metrics = calculateQualityMetrics(content, validatedData.prompt);
          
          // Save response to database
          const responseId = uuidv4();
          const response = createResponse({
            id: responseId,
            experiment_id: experimentId,
            temperature,
            top_p,
            content,
            metrics,
          });
          
          return response;
        } catch (error) {
          console.error('Error generating response:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          // Create a failed response record
          return {
            id: uuidv4(),
            experiment_id: experimentId,
            temperature,
            top_p,
            content: `Error: ${errorMessage}`,
            metrics: {
              coherence: { score: 0, explanation: 'Generation failed' },
              lexicalDiversity: { score: 0, explanation: 'Generation failed' },
              completeness: { score: 0, explanation: 'Generation failed' },
              readability: { score: 0, explanation: 'Generation failed' },
              lengthAppropriate: { score: 0, explanation: 'Generation failed' },
              overallScore: 0,
            },
            created_at: new Date().toISOString(),
          };
        }
      })
    );
    
    const result: GenerateResponse = {
      experiment,
      responses,
    };
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Generate API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : '';
    
    if (errorMessage.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }
    
    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate responses', message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Generate evenly distributed parameter combinations
 */
function generateParameterCombinations(
  tempMin: number,
  tempMax: number,
  topPMin: number,
  topPMax: number,
  count: number
): Array<{ temperature: number; top_p: number }> {
  const combinations: Array<{ temperature: number; top_p: number }> = [];
  
  if (count === 1) {
    // If only one variation, use middle values
    return [{
      temperature: (tempMin + tempMax) / 2,
      top_p: (topPMin + topPMax) / 2,
    }];
  }
  
  // Generate evenly distributed combinations
  const stepsPerParam = Math.ceil(Math.sqrt(count));
  const tempStep = (tempMax - tempMin) / Math.max(1, stepsPerParam - 1);
  const topPStep = (topPMax - topPMin) / Math.max(1, stepsPerParam - 1);
  
  for (let i = 0; i < stepsPerParam && combinations.length < count; i++) {
    for (let j = 0; j < stepsPerParam && combinations.length < count; j++) {
      const temperature = Number((tempMin + i * tempStep).toFixed(2));
      const top_p = Number((topPMin + j * topPStep).toFixed(2));
      
      // Ensure within bounds
      const clampedTemp = Math.min(tempMax, Math.max(tempMin, temperature));
      const clampedTopP = Math.min(topPMax, Math.max(topPMin, top_p));
      
      combinations.push({
        temperature: clampedTemp,
        top_p: clampedTopP,
      });
    }
  }
  
  return combinations.slice(0, count);
}

