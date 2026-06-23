import React, { useState, useEffect } from 'react';
import { ChildProfile, LLMConfig, SUPPORTED_LLM_PROVIDERS } from '../../shared/types/config';

interface LLMModel {
  id: string;
  name: string;
  inputCostPer1mTokens: number;
  outputCostPer1mTokens: number;
}

interface OnboardingFormProps {
  step: 'profile' | 'llm' | 'model';
  onSubmit: (data: ChildProfile | Partial<LLMConfig> | string) => void;
  loading?: boolean;
  modelId?: string;
  availableModels?: LLMModel[];
  initialData?: Partial<ChildProfile> | Partial<LLMConfig>;
}

function OnboardingForm({
  step,
  onSubmit,
  loading = false,
  modelId = '',
  availableModels = [],
  initialData = {},
}: OnboardingFormProps): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    provider: '',
    apiToken: '',
  });
  const [selectedModel, setSelectedModel] = useState(modelId);

  // Load initial data when component mounts or initialData changes
  useEffect(() => {
    if (initialData && step === 'profile') {
      const profile = initialData as Partial<ChildProfile>;
      setFormData((prev) => ({
        ...prev,
        name: profile.name || '',
        age: profile.age ? String(profile.age) : '',
        country: profile.country || '',
      }));
    } else if (initialData && step === 'llm') {
      const config = initialData as Partial<LLMConfig>;
      setFormData((prev) => ({
        ...prev,
        provider: config.provider || '',
        apiToken: config.apiToken || '',
      }));
    }
  }, [initialData, step]);

  useEffect(() => {
    setSelectedModel(modelId);
  }, [modelId]);

  useEffect(() => {
    if (step === 'model') {
      console.log('Model step - Available models:', availableModels);
      console.log('Model step - Selected model:', selectedModel);
    }
  }, [step, availableModels]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    if (step === 'profile') {
      onSubmit({
        name: formData.name,
        age: parseInt(formData.age, 10),
        country: formData.country,
      });
    } else if (step === 'llm') {
      onSubmit({
        provider: formData.provider as 'openai' | 'anthropic' | 'cohere' | 'xai' | 'gemini' | 'mock',
        apiToken: formData.apiToken,
      });
    } else if (step === 'model') {
      onSubmit(selectedModel);
    }
  };

  if (step === 'profile') {
    return (
      <form onSubmit={handleSubmit} className="onboarding-form">
        <div className="form-group">
          <label htmlFor="name">Child's Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age (10-16)</label>
          <input
            id="age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="10"
            max="16"
            required
            placeholder="Enter your age"
          />
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            placeholder="Enter your country"
          />
        </div>

        <button type="submit" className="btn-submit">
          Next
        </button>
      </form>
    );
  }

  if (step === 'llm') {
    return (
      <form onSubmit={handleSubmit} className="onboarding-form">
        <div className="form-group">
          <label htmlFor="provider">LLM Provider</label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            required
          >
            <option value="">Select a provider</option>
            <option value="mock">📝 Mock (Demo Mode)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="cohere">Cohere</option>
            <option value="xai">xAI (Grok)</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="apiToken">API Token</label>
          <input
            id="apiToken"
            type="password"
            name="apiToken"
            value={formData.apiToken}
            onChange={handleChange}
            required
            placeholder="Enter your API token"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Validating...' : 'Validate & Next'}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!selectedModel) {
          alert('Please select a model');
          return;
        }
        onSubmit(selectedModel);
      }}
      className="onboarding-form"
    >
      <div className="form-group">
        <label htmlFor="model">Select AI Model</label>
        {availableModels.length === 0 ? (
          <p style={{ color: '#d32f2f', fontSize: '0.9rem' }}>
            ⚠️ No models available. Check your API token and try again.
          </p>
        ) : (
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            required
          >
            <option value="">Choose a model ({availableModels.length} available)</option>
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} (${model.inputCostPer1mTokens}/${model.outputCostPer1mTokens} per 1M tokens)
                {model.id === modelId ? ' ⭐ Cheapest' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {availableModels.length > 0 && (
        <p className="info" style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
          Select a model or use the ⭐ recommended cheapest option. All models can generate quality content.
        </p>
      )}

      <button type="submit" className="btn-submit" disabled={availableModels.length === 0}>
        Complete Setup
      </button>
    </form>
  );
}

export default OnboardingForm;
