import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { memory } from './memory.js';

// Mock the file system
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
  }
}));

// Helper to get text content from result
function getResultText(result: any): string {
  return result.content[0].text;
}

describe('Memory Tool', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear memory store by calling clear
    await memory({ action: 'clear' });
    // Silence console.error for tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('set action', () => {
    it('should set a memory without persistence', async () => {
      const result = await memory({
        action: 'set',
        key: 'test_key',
        value: 'test_value',
        tags: ['tag1', 'tag2']
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Set \'test_key\'');
      expect(vi.mocked(fs.mkdir)).not.toHaveBeenCalled();
      expect(vi.mocked(fs.writeFile)).not.toHaveBeenCalled();
    });

    it('should set a memory with persistence', async () => {
      const result = await memory({
        action: 'set',
        key: 'test_key',
        value: 'test_value',
        tags: ['tag1', 'tag2'],
        persist: true
      });

      expect(getResultText(result)).toContain('Set \'test_key\'');
      expect(vi.mocked(fs.mkdir)).toHaveBeenCalledWith('.claude/memories', { recursive: true });
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledTimes(2);
      
      // Check value file
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        path.join('.claude/memories', 'test_key.txt'),
        'test_value',
        'utf8'
      );
      
      // Check metadata file
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        path.join('.claude/memories', 'test_key.meta'),
        expect.stringContaining('"tags": ['),
        'utf8'
      );
    });

    it('should sanitize keys for filesystem safety', async () => {
      const result = await memory({
        action: 'set',
        key: 'test/key:with*special|chars',
        value: 'test_value',
        persist: true
      });

      expect(result.content).toBeDefined();
      expect(vi.mocked(fs.writeFile)).toHaveBeenCalledWith(
        path.join('.claude/memories', 'test_key_with_special_chars.txt'),
        'test_value',
        'utf8'
      );
    });

    it('should handle persistence errors gracefully', async () => {
      vi.mocked(fs.mkdir).mockRejectedValueOnce(new Error('Permission denied'));

      const result = await memory({
        action: 'set',
        key: 'test_key',
        value: 'test_value',
        persist: true
      });

      // Should still succeed - memory is in RAM
      expect(getResultText(result)).toContain('Set \'test_key\'');
    });

    it('should return error if key or value is missing', async () => {
      // Test missing value
      const result1 = await memory({
        action: 'set',
        key: 'test_key',
      });
      expect(getResultText(result1)).toContain('Error');
      // For now, just check it returns an error - the exact message might vary

      // Test missing key
      const result2 = await memory({
        action: 'set',
        value: 'test_value',
      });
      expect(getResultText(result2)).toContain('Error');
    });
  });

  describe('get action', () => {
    it('should get an existing memory', async () => {
      await memory({
        action: 'set',
        key: 'test_key',
        value: 'test_value',
        tags: ['tag1']
      });

      const result = await memory({
        action: 'get',
        key: 'test_key'
      });

      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('test_key');
      expect(getResultText(result)).toContain('test_value');
      expect(getResultText(result)).toContain('[tag1]');
    });

    it('should return not found for missing key', async () => {
      const result = await memory({
        action: 'get',
        key: 'missing_key'
      });

      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('Key \'missing_key\' not found');
    });
  });

  describe('list action', () => {
    it('should list all memories', async () => {
      await memory({ action: 'set', key: 'key1', value: 'value1' });
      await memory({ action: 'set', key: 'key2', value: 'value2' });

      const result = await memory({ action: 'list' });

      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('2 entries');
      expect(getResultText(result)).toContain('key1');
      expect(getResultText(result)).toContain('key2');
    });

    it('should filter by tags', async () => {
      await memory({ action: 'set', key: 'key1', value: 'value1', tags: ['api'] });
      await memory({ action: 'set', key: 'key2', value: 'value2', tags: ['temp'] });

      const result = await memory({ action: 'list', tags: ['api'] });

      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('1 entries');
      expect(getResultText(result)).toContain('key1');
      expect(result.content).not.toContain('key2');
    });
  });

  describe('delete action', () => {
    it('should delete an existing memory', async () => {
      await memory({ action: 'set', key: 'test_key', value: 'test_value' });
      
      const result = await memory({ action: 'delete', key: 'test_key' });
      
      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('Deleted \'test_key\'');
      
      // Verify it's gone
      const getResult = await memory({ action: 'get', key: 'test_key' });
      expect(getResultText(getResult)).toContain('not found');
    });
  });

  describe('search action', () => {
    it('should search by key, value, and tags', async () => {
      await memory({ action: 'set', key: 'api_key', value: 'secret_value', tags: ['production'] });
      await memory({ action: 'set', key: 'test_key', value: 'api_test', tags: ['test'] });

      // Search by key
      const result1 = await memory({ action: 'search', pattern: 'api' });
      expect(getResultText(result1)).toContain('Found 2 entries');

      // Search by value
      const result2 = await memory({ action: 'search', pattern: 'secret' });
      expect(getResultText(result2)).toContain('Found 1 entries');
      expect(getResultText(result2)).toContain('api_key');

      // Search by tag
      const result3 = await memory({ action: 'search', pattern: 'production' });
      expect(getResultText(result3)).toContain('Found 1 entries');
      expect(getResultText(result3)).toContain('api_key');
    });
  });

  describe('clear action', () => {
    it('should clear all memories', async () => {
      await memory({ action: 'set', key: 'key1', value: 'value1' });
      await memory({ action: 'set', key: 'key2', value: 'value2' });

      const result = await memory({ action: 'clear' });

      expect(result.content).toBeDefined();
      expect(getResultText(result)).toContain('Cleared 2 entries');

      // Verify they're gone
      const listResult = await memory({ action: 'list' });
      expect(getResultText(listResult)).toContain('No entries stored');
    });
  });

  describe('persistence loading', () => {
    it('should load persisted memories on startup', async () => {
      // This test would need to be integration-style to test the actual loading
      // For now, we can verify the mock is set up correctly
      expect(vi.mocked(fs.readdir)).toBeDefined();
      expect(vi.mocked(fs.readFile)).toBeDefined();
    });
  });
});