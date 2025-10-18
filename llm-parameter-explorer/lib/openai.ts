import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  return openaiClient;
}

export interface GenerateCompletionParams {
  prompt: string;
  temperature: number;
  top_p: number;
  maxTokens?: number;
}

export async function generateCompletion({
  prompt,
  temperature,
  top_p,
  maxTokens = 500
}: GenerateCompletionParams): Promise<string> {
  const client = getOpenAIClient();
  
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      top_p,
      max_tokens: maxTokens,
    });
    
    const content = completion.choices[0]?.message?.content || '';
    return content;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (err?.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key.');
    } else if (err?.status === 500 || err?.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again.');
    } else {
      throw new Error(`OpenAI API error: ${err?.message || 'Unknown error'}`);
    }
  }
}

