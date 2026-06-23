export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  llmProvider?: string;
  llmApiKey?: string;
}

export function loadConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    llmProvider: process.env.LLM_PROVIDER,
    llmApiKey: process.env.LLM_API_KEY,
  };
}

export function validateConfig(config: AppConfig): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }
}
