import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigurationService } from './ConfigurationService';

describe('ConfigurationService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mock('./EncryptionService');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return null if no configuration exists', () => {
    const config = ConfigurationService.loadConfiguration();
    expect(config).toBeNull();
  });

  it('should return false for isConfigured when nothing is saved', () => {
    const configured = ConfigurationService.isConfigured();
    expect(configured).toBe(false);
  });

  it('should clear configuration', () => {
    localStorage.setItem('test', 'value');
    ConfigurationService.clearConfiguration();
    const config = ConfigurationService.loadConfiguration();
    expect(config).toBeNull();
  });
});
