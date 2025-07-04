import { readFile } from 'fs/promises';
import { join } from 'path';
import { ProjectConfig, MusicConfig } from '../types/index.js';

let cachedConfig: ProjectConfig | null = null;

function getDefaultMusicConfig(): MusicConfig {
  return {
    playlists: {
      focus: {
        uri: 'spotify:playlist:37i9dQZF1DWZeKCadgRdKQ',  // Deep Focus
        name: 'Classical Focus',
        description: 'Classical pieces for deep concentration including Holst, Bach, and Satie'
      },
      relax: {
        uri: 'spotify:playlist:37i9dQZF1DX6ziVCJnEm59',  // Peaceful Piano
        name: 'Peaceful Classical',
        description: 'Calming classical pieces including Debussy and Chopin'
      },
      energize: {
        uri: 'spotify:album:4v0Xyz0LVToUsSTGdsvKSK',  // Holst: The Planets
        name: 'The Planets Suite',
        description: 'Holst\'s The Planets - powerful and motivating'
      },
      chill: {
        uri: 'spotify:playlist:37i9dQZF1DX5GQZoazoBeW',  // Brain Food
        name: 'Ambient Classical',
        description: 'Modern classical and ambient pieces'
      },
      work: {
        uri: 'spotify:playlist:37i9dQZF1DX7K31D69s4M1',  // Classical Essentials
        name: 'Classical Essentials',
        description: 'Essential classical pieces including Grieg, Barber, and Bach'
      }
    },
    defaultMood: 'focus',
    safeVolume: 70,
    volumeIncrement: 20,
    shuffle: false,
    repeat: true
  };
}

function getDefaultConfig(): ProjectConfig {
  return {
    testCommand: 'npm test',
    lintCommand: 'npm run lint',
    openaiModel: process.env.OPENAI_MODEL ?? 'o1-preview',
    aiProvider: (process.env.AI_PROVIDER as 'openai' | 'ollama' | undefined) ?? 'openai',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL ?? 'llama2',
    music: getDefaultMusicConfig(),
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
    const defaultConfig = getDefaultConfig();
    
    // Deep merge music configuration
    let mergedMusic = defaultConfig.music;
    if (userConfig.music) {
      mergedMusic = {
        ...defaultConfig.music,
        ...userConfig.music,
        playlists: {
          ...defaultConfig.music?.playlists,
          ...userConfig.music.playlists,
        },
      };
    }
    
    cachedConfig = {
      ...defaultConfig,
      ...userConfig,
      music: mergedMusic,
    };
    
    return cachedConfig;
  } catch {
    cachedConfig = getDefaultConfig();
    return cachedConfig;
  }
}

// For testing purposes only
export function resetConfigCache(): void {
  cachedConfig = null;
}