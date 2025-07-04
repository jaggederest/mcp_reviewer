import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFile } from 'fs/promises';
import { loadProjectConfig, getOpenAIKey, resetConfigCache } from './config.js';

vi.mock('fs/promises');

describe('config utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetConfigCache();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  describe('loadProjectConfig', () => {
    it('should return default config when no .reviewer.json exists', async () => {
      vi.mocked(readFile).mockRejectedValueOnce(new Error('File not found'));
      
      const config = await loadProjectConfig();
      
      expect(config).toEqual({
        testCommand: 'npm test',
        lintCommand: 'npm run lint',
        buildCommand: 'npm run build',
        openaiModel: 'o1-preview',
      });
    });

    it('should merge user config with defaults', async () => {
      const userConfig = {
        testCommand: 'yarn test',
        openaiModel: 'gpt-4',
      };
      
      vi.mocked(readFile).mockResolvedValueOnce(JSON.stringify(userConfig));
      
      const config = await loadProjectConfig();
      
      expect(config).toEqual({
        testCommand: 'yarn test',
        lintCommand: 'npm run lint',
        buildCommand: 'npm run build',
        openaiModel: 'gpt-4',
      });
    });

    it('should use OPENAI_MODEL env var when set', async () => {
      process.env.OPENAI_MODEL = 'o3-mini';
      vi.mocked(readFile).mockRejectedValueOnce(new Error('File not found'));
      
      const config = await loadProjectConfig();
      
      expect(config.openaiModel).toBe('o3-mini');
    });
  });

  describe('getOpenAIKey', () => {
    it('should return API key when set', () => {
      process.env.OPENAI_API_KEY = 'test-key-123';
      
      expect(getOpenAIKey()).toBe('test-key-123');
    });

    it('should throw error when API key is not set', () => {
      expect(() => getOpenAIKey()).toThrow('OPENAI_API_KEY environment variable is not set');
    });
  });
});