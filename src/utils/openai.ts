import OpenAI from 'openai';
import { getOpenAIKey, loadProjectConfig } from './config.js';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  openaiClient ??= new OpenAI({
    apiKey: getOpenAIKey(),
  });
  return openaiClient;
}

export async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = getOpenAIClient();
  const config = await loadProjectConfig();
  
  try {
    const response = await client.chat.completions.create({
      model: config.openaiModel ?? 'o1-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return response.choices[0]?.message?.content ?? 'No response generated';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`OpenAI API call failed: ${errorMessage}`);
  }
}