import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSpec } from './generateSpec.js';
import * as aiModule from '../utils/ai.js';

vi.mock('../utils/ai.js');

describe('generateSpec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a specification successfully', async () => {
    const mockResponse = '# API Specification\n\n## Overview\n...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    const result = await generateSpec({
      prompt: 'REST API for user management',
      context: 'Must support OAuth2',
      format: 'markdown',
    });

    expect(result.content[0].text).toBe(mockResponse);
    expect(aiModule.callAI).toHaveBeenCalledWith(
      expect.stringContaining('technical specification writer'),
      expect.stringContaining('REST API for user management')
    );
  });

  it('should handle structured format request', async () => {
    const mockResponse = '## Requirements\n...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    await generateSpec({
      prompt: 'Database schema',
      format: 'structured',
    });

    expect(aiModule.callAI).toHaveBeenCalledWith(
      expect.stringContaining('structured format'),
      expect.any(String)
    );
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(aiModule.callAI).mockRejectedValueOnce(new Error('API error'));

    const result = await generateSpec({
      prompt: 'Test spec',
    });

    expect(result.content[0].text).toContain('Error generating specification: API error');
  });
});