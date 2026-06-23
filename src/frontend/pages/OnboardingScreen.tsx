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

  const handleProfileSubmit = (profile: ChildProfile): void => {
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

  const handleLLMConfigSubmit = async (config: Partial<LLMConfig>): Promise<void> => {
    if (!config.provider || !config.apiToken) {
      setError('Provider and API token are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { ConfigApi } = await import('../services/ApiService');
      const data = await ConfigApi.listModels(config.provider, config.apiToken);

      // Store all models and set default to cheapest
      const models = data.models || [];
      console.log('Available models:', models);
      setAvailableModels(models);

      setLLMConfig({
        provider: config.provider as 'openai' | 'anthropic' | 'cohere' | 'xai' | 'gemini' | 'mock',
        apiToken: config.apiToken,
        selectedModel: data.recommended.id,
      });

      setStep('model');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Model fetch error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelection = (modelId: string): void => {
    setLLMConfig({ ...llmConfig, selectedModel: modelId });
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
