import React, { useState, useEffect } from 'react';
import { ConfigurationService } from './services/ConfigurationService';
import { EncryptionService } from './services/EncryptionService';
import OnboardingScreen from './pages/OnboardingScreen';
import NewspaperApp from './pages/NewspaperApp';

function App(): JSX.Element {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      EncryptionService.initialize();
      const configured = ConfigurationService.isConfigured();
      setIsConfigured(configured);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOnboardingComplete = (): void => {
    setIsConfigured(true);
  };

  const handleReset = (): void => {
    setIsConfigured(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {isConfigured ? (
        <NewspaperApp onReset={handleReset} />
      ) : (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;
