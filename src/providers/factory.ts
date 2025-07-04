import { AIProvider, AIProviderConfig } from './types.js';
import { OpenAIProvider } from './openai.js';
import { OllamaProvider } from './ollama.js';

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      if (!config.apiKey) {
        throw new Error('OpenAI provider requires an API key');
      }
      return new OpenAIProvider(config.apiKey, config.model);
    
    case 'ollama':
      return new OllamaProvider(config.baseUrl, config.model);
    
    default:
      throw new Error(`Unknown AI provider: ${config.provider as string}`);
  }
}