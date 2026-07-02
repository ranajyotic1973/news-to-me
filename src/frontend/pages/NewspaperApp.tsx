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
  const [showNoMoreStories, setShowNoMoreStories] = useState(false);

  // Meaning feature
  const { selection, clearSelection } = useTextSelection();
  const [meaning, setMeaning] = useState<string | null>(null);
  const [meaningLoading, setMeaningLoading] = useState(false);

  const loadPage = async (pageNum: number): Promise<void> => {
    setLoading(true);
    setError('');
    setShowNoMoreStories(false);

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

      // Check if we got stories
      if (!pageData.stories || pageData.stories.length === 0) {
        console.log('[NewspaperApp] No stories returned for page', pageNum);
        setShowNoMoreStories(true);
        // Keep user on the previous page
        return;
      }

      setCurrentPage(pageNum);
      setTotalPages(pageData.totalPages);
      setStories(pageData.stories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page';
      console.error('[NewspaperApp] Error loading page:', errorMessage);
      setShowNoMoreStories(true);
      // Keep user on current page
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = (): void => {
    console.log('[NewspaperApp] Next button clicked, loading page', currentPage + 1);
    loadPage(currentPage + 1);
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
    // Clear cache when settings change (backend will handle this via IPC)
    setCurrentPage(1);
    setTotalPages(1);
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

      {/* No more stories popup */}
      {showNoMoreStories && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '400px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2 style={{ marginBottom: '15px', color: '#333' }}>No More News</h2>
            <p style={{ marginBottom: '20px', color: '#666', fontSize: '1rem' }}>
              You've reached the end of available news. Please try again later for more updates!
            </p>
            <button
              onClick={() => setShowNoMoreStories(false)}
              style={{
                padding: '10px 30px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5568d3')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#667eea')}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewspaperApp;
