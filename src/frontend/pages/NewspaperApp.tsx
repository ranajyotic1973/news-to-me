import React, { useState, useEffect } from 'react';
import { ConfigurationService } from '../services/ConfigurationService';
import { NewspaperApi, NewspaperPageResponse, NewsStory } from '../services/ApiService';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { useSwipeNavigation } from '../hooks/useSwipeNavigation';
import { useTextSelection } from '../hooks/useTextSelection';
import { SelectionPopup } from '../components/SelectionPopup';
import { MeaningPopup } from '../components/MeaningPopup';
import NewspaperPage from '../components/NewspaperPage';
import OnboardingScreen from './OnboardingScreen';

interface NewspaperAppProps {
  onReset?: () => void;
}

function NewspaperApp({ onReset }: NewspaperAppProps): JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Meaning feature
  const { selection, clearSelection } = useTextSelection();
  const [meaning, setMeaning] = useState<string | null>(null);
  const [meaningLoading, setMeaningLoading] = useState(false);

  const loadPage = async (pageNum: number): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const config = ConfigurationService.loadConfiguration();
      if (!config) {
        throw new Error('Configuration not found');
      }

      const pageData = await NewspaperApi.getPage(
        pageNum,
        config.childProfile.age,
        config.childProfile.country,
        config.llmConfig.provider,
        config.llmConfig.apiToken,
        config.llmConfig.selectedModel
      );

      setCurrentPage(pageNum);
      setTotalPages(pageData.totalPages);
      setStories(pageData.stories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  };

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  useKeyboardNavigation({
    onPrevious: handlePreviousPage,
    onNext: handleNextPage,
    enabled: !loading,
  });

  useSwipeNavigation({
    onSwipeLeft: handleNextPage,
    onSwipeRight: handlePreviousPage,
    enabled: !loading,
    threshold: 50,
  });

  const handleOpenSettings = (): void => {
    setShowSettings(true);
  };

  const handleSettingsSaved = (): void => {
    setShowSettings(false);
    loadPage(1);
  };

  const handleResetApp = (): void => {
    ConfigurationService.clearConfiguration();
    if (onReset) {
      onReset();
    }
  };

  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const getFilteredStories = (): NewsStory[] => {
    if (selectedCategory === 'all') {
      return stories;
    }
    return stories.filter((story) => story.category === selectedCategory);
  };

  const handleGetMeaning = async (selectedText: string): Promise<void> => {
    setMeaningLoading(true);
    try {
      const config = ConfigurationService.loadConfiguration();
      if (!config) {
        throw new Error('Configuration not found');
      }

      console.log('[NewspaperApp] Requesting meaning for:', selectedText);

      const response = await window.electron?.api?.invoke('meaning:getMeaning', {
        selectedText,
        provider: config.llmConfig.provider,
        apiToken: config.llmConfig.apiToken,
        modelId: config.llmConfig.selectedModel,
      });

      console.log('[NewspaperApp] Received meaning response:', response);
      setMeaning(response.meaning);
    } catch (err) {
      console.error('[NewspaperApp] Failed to get meaning:', err);
      setMeaning('Unable to get meaning. Please try again.');
    } finally {
      setMeaningLoading(false);
    }
  };

  if (showSettings) {
    return (
      <OnboardingScreen onConfigurationComplete={handleSettingsSaved} />
    );
  }

  if (error) {
    return (
      <div className="newspaper-app error-state">
        <div className="error-message">
          <h2>Error Loading Content</h2>
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => loadPage(1)} className="btn-submit">
              Try Again
            </button>
            <button onClick={handleOpenSettings} className="btn-submit" style={{ backgroundColor: '#666' }}>
              Change Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="newspaper-app">
      <button
        onClick={handleOpenSettings}
        title="Settings - Change LLM provider or API key"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          fontSize: '1.2rem',
          color: '#333',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          zIndex: 101,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.2) rotate(15deg)';
          e.currentTarget.style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.opacity = '1';
        }}
      >
        <i className="fas fa-cog"></i>
      </button>
      <NewspaperPage
        pageNumber={currentPage}
        totalPages={totalPages}
        stories={getFilteredStories()}
        loading={loading}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        currentTopic={selectedCategory}
        onTopicChange={handleCategoryChange}
      />

      {/* Selection popup for getting meaning */}
      {selection && !meaning && (
        <SelectionPopup
          selectedText={selection.text}
          position={selection.position}
          onMeaningClick={handleGetMeaning}
          isLoading={meaningLoading}
        />
      )}

      {/* Meaning popup displaying LLM response */}
      {meaning && selection && (
        <MeaningPopup
          selectedText={selection.text}
          meaning={meaning}
          position={selection.position}
          onClose={() => {
            setMeaning(null);
            clearSelection();
          }}
        />
      )}
    </div>
  );
}

export default NewspaperApp;
