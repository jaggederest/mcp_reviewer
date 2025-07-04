export interface AIProvider {
  name: string;
  chat(systemPrompt: string, userPrompt: string): Promise<string>;
}

export interface AIProviderConfig {
  provider: 'openai' | 'ollama';
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}