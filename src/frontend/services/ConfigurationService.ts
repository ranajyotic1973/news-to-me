import { AppConfiguration, ChildProfile, LLMConfig } from '../../shared/types/config';
import { EncryptionService } from './EncryptionService';

const CONFIG_STORAGE_KEY = 'news-to-me-config';

export class ConfigurationService {
  static loadConfiguration(): AppConfiguration | null {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return null;

    try {
      const decrypted = EncryptionService.decrypt(stored);
      const config = JSON.parse(decrypted) as AppConfiguration;
      return config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return null;
    }
  }

  static saveConfiguration(config: AppConfiguration): void {
    const toStore: AppConfiguration = {
      ...config,
      updatedAt: Date.now(),
    };

    try {
      const encrypted = EncryptionService.encrypt(JSON.stringify(toStore));
      localStorage.setItem(CONFIG_STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  static saveChildProfile(profile: ChildProfile): void {
    const existing = ConfigurationService.loadConfiguration();
    const config: AppConfiguration = existing || {
      childProfile: profile,
      llmConfig: {
        provider: 'openai',
        apiToken: '',
        selectedModel: '',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    config.childProfile = profile;
    ConfigurationService.saveConfiguration(config);
  }

  static saveLLMConfiguration(llmConfig: LLMConfig): void {
    const existing = ConfigurationService.loadConfiguration();
    if (!existing) {
      throw new Error('Child profile must be set first');
    }

    existing.llmConfig = llmConfig;
    ConfigurationService.saveConfiguration(existing);
  }

  static clearConfiguration(): void {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }

  static isConfigured(): boolean {
    const config = ConfigurationService.loadConfiguration();
    return !!(
      config &&
      config.childProfile?.name &&
      config.childProfile?.age &&
      config.childProfile?.country &&
      config.llmConfig?.apiToken &&
      config.llmConfig?.selectedModel
    );
  }
}
