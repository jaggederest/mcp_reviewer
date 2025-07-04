import { readFile } from 'fs/promises';
import { join } from 'path';
import { ProjectConfig } from '../types/index.js';

let cachedConfig: ProjectConfig | null = null;

function getDefaultConfig(): ProjectConfig {
  return {
    testCommand: 'npm test',
    lintCommand: 'npm run lint',
    buildCommand: 'npm run build',
    openaiModel: process.env.OPENAI_MODEL ?? 'o1-preview',
    aiProvider: (process.env.AI_PROVIDER as 'openai' | 'ollama' | undefined) ?? 'openai',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL ?? 'llama2',
  };
}

export async function loadProjectConfig(): Promise<ProjectConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = join(process.cwd(), '.reviewer.json');
    const configData = await readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(configData) as ProjectConfig;
    
    cachedConfig = {
      ...getDefaultConfig(),
      ...userConfig,
    };
    
    return cachedConfig;
  } catch {
    cachedConfig = getDefaultConfig();
    return cachedConfig;
  }
}

export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return apiKey;
}

// For testing purposes only
export function resetConfigCache(): void {
  cachedConfig = null;
}