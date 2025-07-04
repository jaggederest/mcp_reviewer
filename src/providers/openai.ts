import OpenAI from 'openai';
import { AIProvider } from './types.js';
import { ProviderError } from './errors.js';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'o1-preview') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      return response.choices[0]?.message?.content ?? 'No response generated';
    } catch (error) {
      throw new ProviderError(this.name, error);
    }
  }
}