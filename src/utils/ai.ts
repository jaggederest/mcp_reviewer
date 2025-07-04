import { loadProjectConfig } from './config.js';
import { createAIProvider } from '../providers/factory.js';
import { AIProvider } from '../providers/types.js';

let cachedProvider: AIProvider | null = null;

export async function getAIProvider(): Promise<AIProvider> {
  if (cachedProvider) {
    return cachedProvider;
  }

  const config = await loadProjectConfig();
  
  cachedProvider = createAIProvider({
    provider: config.aiProvider ?? 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: config.aiProvider === 'ollama' ? config.ollamaModel : config.openaiModel,
    baseUrl: config.ollamaBaseUrl,
  });

  return cachedProvider;
}

export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const provider = await getAIProvider();
  return provider.chat(systemPrompt, userPrompt);
}

// For testing purposes only
export function resetAIProvider(): void {
  cachedProvider = null;
}