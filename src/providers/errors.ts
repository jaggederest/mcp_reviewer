/**
 * Custom error class for AI provider errors
 */
export class ProviderError extends Error {
  constructor(providerName: string, originalError: unknown) {
    const message = originalError instanceof Error ? originalError.message : 'Unknown error';
    super(`${providerName} API call failed: ${message}`);
    this.name = 'ProviderError';
  }
}