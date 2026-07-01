import React, { useState, useEffect } from 'react';
import { ConfigurationService } from '../services/ConfigurationService';
import { ValidationService } from '../services/ValidationService';
import { AppConfiguration, ChildProfile, LLMConfig } from '../../shared/types/config';
import OnboardingForm from '../components/OnboardingForm';

interface LLMModel {
  id: string;
  name: string;
  inputCostPer1mTokens: number;
  outputCostPer1mTokens: number;
}

interface OnboardingScreenProps {
  onComplete?: () => void;
  onConfigurationComplete?: () => void;
}

function OnboardingScreen({ onComplete, onConfigurationComplete }: OnboardingScreenProps): JSX.Element {
  const [step, setStep] = useState<'profile' | 'llm' | 'model'>('profile');
  const [childProfile, setChildProfile] = useState<Partial<ChildProfile>>({});
  const [llmConfig, setLLMConfig] = useState<Partial<LLMConfig>>({});
  const [availableModels, setAvailableModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load saved configuration on mount
  useEffect(() => {
    const saved = ConfigurationService.loadConfiguration();
    if (saved) {
      setChildProfile(saved.childProfile);
      setLLMConfig(saved.llmConfig);
    }
  }, []);

  const handleProfileSubmit = (data: ChildProfile | Partial<LLMConfig> | string): void => {
    if (typeof data === 'string') return;
    if ('provider' in data) return;

    const profile = data as ChildProfile;
    const errors = [
      ValidationService.validateName(profile.name),
      ValidationService.validateAge(profile.age),
      ValidationService.validateCountry(profile.country),
    ].filter(Boolean);

    if (errors.length > 0) {
      setError(errors[0]?.message || 'Validation error');
      return;
    }

    setChildProfile(profile);
    setError('');
    setStep('llm');
  };

  const handleLLMConfigSubmit = async (data: ChildProfile | Partial<LLMConfig> | string): Promise<void> => {
    if (typeof data === 'string' || !('provider' in data)) return;

    const config = data as Partial<LLMConfig>;
    if (!config.provider || !config.apiToken) {
      setError('Provider and API token are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Save child profile first (if not already saved)
      if (childProfile.name && childProfile.age && childProfile.country) {
        ConfigurationService.saveChildProfile(childProfile as ChildProfile);
      }

      // 2. Validate token first to ensure it's correct
      console.log('[OnboardingScreen] Validating token for', config.provider);
      const { ConfigApi } = await import('../services/ApiService');
      const tokenValidation = await ConfigApi.validateToken(config.provider, config.apiToken);

      if (!tokenValidation.valid) {
        throw new Error(tokenValidation.error || 'Invalid API token');
      }

      console.log('[OnboardingScreen] Token validated successfully');

      // 3. Save LLM config immediately so it's available for all subsequent calls
      const tempLLMConfig: LLMConfig = {
        provider: config.provider as 'openai' | 'anthropic' | 'cohere' | 'xai' | 'gemini' | 'mock',
        apiToken: config.apiToken,
        selectedModel: '', // Will be set after model selection
      };

      // Temporarily save to state for this flow
      setLLMConfig(tempLLMConfig);

      // 4. List available models
      console.log('[OnboardingScreen] Listing models...');
      const configData = await ConfigApi.listModels(config.provider, config.apiToken);

      // Store all models and set default to recommended
      const models = configData.models || [];
      console.log('[OnboardingScreen] Available models:', models);
      setAvailableModels(models);

      // 5. Set recommended model and move to selection
      setLLMConfig({
        ...tempLLMConfig,
        selectedModel: configData.recommended.id,
      });

      setStep('model');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('[OnboardingScreen] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelection = (data: ChildProfile | Partial<LLMConfig> | string): void => {
    if (typeof data !== 'string') return;

    setLLMConfig({ ...llmConfig, selectedModel: data });
    saveConfiguration();
  };

  const saveConfiguration = (): void => {
    if (!childProfile.name || !childProfile.age || !childProfile.country) {
      setError('Child profile is incomplete');
      return;
    }

    if (!llmConfig.provider || !llmConfig.apiToken || !llmConfig.selectedModel) {
      setError('LLM configuration is incomplete');
      return;
    }

    try {
      const config: AppConfiguration = {
        childProfile: childProfile as ChildProfile,
        llmConfig: llmConfig as LLMConfig,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      ConfigurationService.saveConfiguration(config);

      // Call the appropriate callback
      if (onConfigurationComplete) {
        onConfigurationComplete();
      } else if (onComplete) {
        onComplete();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(errorMessage);
    }
  };

  return (
    <div className="onboarding-screen">
      <h1>Welcome to News to Me!</h1>
      <p>Let's set up your newspaper for learning about business and markets.</p>

      {error && <div className="error-message">{error}</div>}

      {step === 'profile' && (
        <OnboardingForm
          step="profile"
          onSubmit={handleProfileSubmit}
          initialData={childProfile}
        />
      )}

      {step === 'llm' && (
        <OnboardingForm
          step="llm"
          onSubmit={handleLLMConfigSubmit}
          loading={loading}
          initialData={llmConfig}
        />
      )}

      {step === 'model' && (
        <OnboardingForm
          step="model"
          onSubmit={handleModelSelection}
          modelId={llmConfig.selectedModel}
          availableModels={availableModels}
        />
      )}
    </div>
  );
}

export default OnboardingScreen;
