import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewSpec } from './reviewSpec.js';
import * as aiModule from '../utils/ai.js';

vi.mock('../utils/ai.js');

describe('reviewSpec', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include project context when provided', async () => {
    const mockResponse = '## Summary\nGood MVP approach...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    await reviewSpec({
      spec: 'Test specification content',
      projectContext: 'MVP for startup',
    });

    expect(aiModule.callAI).toHaveBeenCalledWith(
      expect.stringContaining('PROJECT CONTEXT: MVP for startup'),
      expect.any(String)
    );
  });

  it('should handle many focus areas gracefully', async () => {
    const mockResponse = '## Summary\nReview complete...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    const manyAreas = Array(20).fill(0).map((_, i) => `area${i}`);
    
    await reviewSpec({
      spec: 'Test specification',
      focusAreas: manyAreas,
    });

    const callArgs = vi.mocked(aiModule.callAI).mock.calls[0][0];
    // Should only include first 10 areas
    expect(callArgs).toContain('area0');
    expect(callArgs).toContain('area9');
    expect(callArgs).not.toContain('area10');
  });

  it('should truncate long focus areas', async () => {
    const mockResponse = '## Summary\nReview complete...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    const longArea = 'a'.repeat(150); // Longer than 100 char limit
    
    await reviewSpec({
      spec: 'Test specification',
      focusAreas: [longArea],
    });

    const callArgs = vi.mocked(aiModule.callAI).mock.calls[0][0];
    // Should truncate to 100 chars
    expect(callArgs).toContain('a'.repeat(100));
    expect(callArgs).not.toContain('a'.repeat(101));
  });

  it('should produce structured output request with P0-P3 sections', async () => {
    const mockResponse = `## Summary
Brief overview

## P0 (Critical)
- SQL injection vulnerability

## P1 (Important)
- Missing error handling

## P2 (Recommended)
- Add caching

## P3 (Optional)
- Use TypeScript

## Strengths
- Clear API design`;
    
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    const result = await reviewSpec({
      spec: 'API specification with some issues',
    });

    expect(result.content[0].text).toContain('## P0 (Critical)');
    expect(result.content[0].text).toContain('## P1 (Important)');
    expect(result.content[0].text).toContain('## P2 (Recommended)');
    expect(result.content[0].text).toContain('## P3 (Optional)');
    expect(result.content[0].text).toContain('## Strengths');
  });

  it('should use pragmatic review approach', async () => {
    const mockResponse = '## Summary\nPragmatic review...';
    vi.mocked(aiModule.callAI).mockResolvedValueOnce(mockResponse);

    await reviewSpec({
      spec: 'Simple TODO API',
    });

    const systemPrompt = vi.mocked(aiModule.callAI).mock.calls[0][0];
    expect(systemPrompt).toContain('pragmatic technical reviewer');
    expect(systemPrompt).toContain('YAGNI');
    expect(systemPrompt).toContain('help ship working software');
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('AI service unavailable');
    vi.mocked(aiModule.callAI).mockRejectedValueOnce(error);

    const result = await reviewSpec({
      spec: 'Test specification',
    });

    expect(result.content[0].text).toContain('Error reviewing specification');
    expect(result.content[0].text).toContain('AI service unavailable');
  });
});