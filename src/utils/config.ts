import { readFile } from 'fs/promises';
import { join } from 'path';
import { ProjectConfig } from '../types/index.js';

const DEFAULT_CONFIG: ProjectConfig = {
  testCommand: 'npm test',
  lintCommand: 'npm run lint',
  buildCommand: 'npm run build',
  openaiModel: process.env.OPENAI_MODEL ?? 'o1-preview',
};

let cachedConfig: ProjectConfig | null = null;

export async function loadProjectConfig(): Promise<ProjectConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = join(process.cwd(), '.reviewer.json');
    const configData = await readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(configData) as ProjectConfig;
    
    cachedConfig = {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };
    
    return cachedConfig;
  } catch {
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  }
}

export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return apiKey;
}