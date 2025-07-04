import OpenAI from 'openai';
import { AIProvider } from './types.js';
import { ProviderError } from './errors.js';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'o3') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const params: any = {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };

      // o3 models have specific parameter requirements
      if (this.model.startsWith('o3')) {
        params.max_completion_tokens = 4000;
        // o3 models only support default temperature (1)
      } else {
        params.max_tokens = 4000;
        params.temperature = 0.7;
      }

      const response = await this.client.chat.completions.create(params);

      return response.choices[0]?.message?.content ?? 'No response generated';
    } catch (error) {
      throw new ProviderError(this.name, error);
    }
  }
}