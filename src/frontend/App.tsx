import React, { useState, useEffect } from 'react';
import { ConfigurationService } from './services/ConfigurationService';
import { EncryptionService } from './services/EncryptionService';
import OnboardingScreen from './pages/OnboardingScreen';
import NewspaperApp from './pages/NewspaperApp';

function App(): JSX.Element {
  console.log('[App] Component initializing');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[App] useEffect running, initializing...');
    try {
      console.log('[App] Initializing EncryptionService...');
      EncryptionService.initialize();
      console.log('[App] Checking configuration...');
      const configured = ConfigurationService.isConfigured();
      console.log('[App] isConfigured:', configured);
      setIsConfigured(configured);
      console.log('[App] useEffect complete');
    } catch (error) {
      console.error('[App] ✗ Failed to initialize app:', error);
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
