import { MemoryOptions } from '../types/index.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createSuccessResult, createErrorResult } from './base.js';

interface MemoryEntry {
  value: string;
  created: Date;
  tags: string[];
}

// Module-level storage that persists across tool invocations during MCP server lifetime
const memoryStore = new Map<string, MemoryEntry>();
const MAX_ENTRIES = 1000;

// TODO: Add 'summary' action to show key-value pairs with values truncated to 100 characters
// Format: ✅ Memory Summary: key1="value..." [tag1,tag2] | key2="value..." [tag3]

class MemoryTool {
  execute(args: MemoryOptions): CallToolResult {
    try {
      switch (args.action) {
        case 'set':
          return this.setMemory(args);
        case 'get':
          return this.getMemory(args);
        case 'list':
          return this.listMemories(args);
        case 'delete':
          return this.deleteMemory(args);
        case 'search':
          return this.searchMemories(args);
        case 'clear':
          return this.clearMemories();
        default:
          return createErrorResult('Memory', `Unknown action: ${String(args.action)}`);
      }
    } catch (error) {
      return createErrorResult('Memory', error);
    }
  }

  private setMemory(args: MemoryOptions): CallToolResult {
    if (!args.key || !args.value) {
      return createErrorResult('Memory', 'Both key and value are required for set action');
    }

    if (memoryStore.size >= MAX_ENTRIES && !memoryStore.has(args.key)) {
      return createErrorResult('Memory', `Storage limit reached (${MAX_ENTRIES} entries). Delete some entries first.`);
    }

    memoryStore.set(args.key, {
      value: args.value,
      created: new Date(),
      tags: args.tags ?? []
    });

    return createSuccessResult(`✅ Memory: Set '${args.key}' = '${args.value.substring(0, 50)}${args.value.length > 50 ? '...' : ''}'`);
  }

  private getMemory(args: MemoryOptions): CallToolResult {
    if (!args.key) {
      return createErrorResult('Memory', 'Key is required for get action');
    }

    const entry = memoryStore.get(args.key);
    if (!entry) {
      return createSuccessResult(`❌ Memory: Key '${args.key}' not found`);
    }

    return createSuccessResult(`✅ Memory: '${args.key}' = '${entry.value}'${entry.tags.length > 0 ? ` [${entry.tags.join(', ')}]` : ''}`);
  }

  private listMemories(args: MemoryOptions): CallToolResult {
    if (memoryStore.size === 0) {
      return createSuccessResult('✅ Memory: No entries stored');
    }

    const entries = Array.from(memoryStore.entries());
    let filtered = entries;

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      const filterTags = args.tags;
      filtered = entries.filter(([_, entry]) => 
        filterTags.some(tag => entry.tags.includes(tag))
      );
    }

    if (filtered.length === 0) {
      return createSuccessResult(`✅ Memory: No entries found with tags: ${args.tags?.join(', ') ?? ''}`);
    }

    const keys = filtered.map(([key, _]) => key).sort();
    return createSuccessResult(`✅ Memory: ${filtered.length} entries | Keys: ${keys.join(', ')}`);
  }

  private deleteMemory(args: MemoryOptions): CallToolResult {
    if (!args.key) {
      return createErrorResult('Memory', 'Key is required for delete action');
    }

    if (!memoryStore.has(args.key)) {
      return createSuccessResult(`❌ Memory: Key '${args.key}' not found`);
    }

    memoryStore.delete(args.key);
    return createSuccessResult(`✅ Memory: Deleted '${args.key}'`);
  }

  private searchMemories(args: MemoryOptions): CallToolResult {
    if (!args.pattern) {
      return createErrorResult('Memory', 'Pattern is required for search action');
    }

    const pattern = args.pattern.toLowerCase();
    const matches: string[] = [];

    for (const [key, entry] of memoryStore.entries()) {
      if (key.toLowerCase().includes(pattern) || 
          entry.value.toLowerCase().includes(pattern) ||
          entry.tags.some(tag => tag.toLowerCase().includes(pattern))) {
        matches.push(key);
      }
    }

    if (matches.length === 0) {
      return createSuccessResult(`✅ Memory: No entries matching '${args.pattern}'`);
    }

    return createSuccessResult(`✅ Memory: Found ${matches.length} entries matching '${args.pattern}' | Keys: ${matches.sort().join(', ')}`);
  }

  private clearMemories(): CallToolResult {
    const count = memoryStore.size;
    memoryStore.clear();
    return createSuccessResult(`✅ Memory: Cleared ${count} entries`);
  }
}

const tool = new MemoryTool();
export const memory = (args: MemoryOptions): CallToolResult => tool.execute(args);