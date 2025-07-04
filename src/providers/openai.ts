import OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { AIProvider } from './types.js';
import { ProviderError } from './errors.js';

// Constants for OpenAI configuration
const DEFAULT_MAX_TOKENS = 4000;
const DEFAULT_TEMPERATURE = 0.7;

export class OpenAIProvider implements AIProvider {
  public readonly name = 'OpenAI';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const params: ChatCompletionCreateParamsNonStreaming = {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      };

      // o3 models have specific parameter requirements
      // See: https://platform.openai.com/docs/guides/reasoning
      if (this.model.startsWith('o3')) {
        // o3 models use max_completion_tokens instead of max_tokens
        // and only support default temperature (1)
        params.max_completion_tokens = DEFAULT_MAX_TOKENS;
      } else {
        // max_tokens is deprecated in favor of max_completion_tokens for o-series models,
        // but it's still required for non-o models
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        params.max_tokens = DEFAULT_MAX_TOKENS;
        params.temperature = DEFAULT_TEMPERATURE;
      }

      const response = await this.client.chat.completions.create(params);

      return response.choices[0]?.message?.content ?? 'No response generated';
    } catch (error: unknown) {
      throw new ProviderError(this.name, error);
    }
  }
}