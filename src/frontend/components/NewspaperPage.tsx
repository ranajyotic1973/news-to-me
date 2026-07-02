import React from 'react';

export interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  category: 'business' | 'stock-market' | 'sports' | 'math';
  imageUrl?: string;
}

interface NewspaperPageProps {
  pageNumber: number;
  totalPages: number;
  stories: NewsStory[];
  loading?: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  currentTopic?: string;
  onTopicChange?: (topic: string) => void;
}

function NewspaperPage({
  pageNumber,
  totalPages,
  stories,
  loading = false,
  onNextPage,
  onPreviousPage,
  currentTopic = 'all',
  onTopicChange,
}: NewspaperPageProps): JSX.Element {
  const displayStories = stories.length > 0 ? stories : [];

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'business':
        return '#003366';
      case 'stock-market':
        return '#006633';
      case 'sports':
        return '#663300';
      case 'math':
        return '#330066';
      default:
        return '#333333';
    }
  };

  if (loading) {
    return (
      <div className="newspaper-page loading-state">
        <div className="loading-spinner">
          <p>Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="newspaper-page">
      {/* Header */}
      <div className="newspaper-header">
        <h1>NEWS TO ME</h1>
        <p className="tagline">Your Daily News for Learning & Exploration</p>

        {/* Topic Navigation */}
        <div className="topic-navigation">
          <button
            className={`topic-btn ${currentTopic === 'all' ? 'active' : ''}`}
            onClick={() => onTopicChange?.('all')}
            title="All Topics"
          >
            <i className="fas fa-newspaper"></i> All
          </button>
          <button
            className={`topic-btn ${currentTopic === 'business' ? 'active' : ''}`}
            onClick={() => onTopicChange?.('business')}
            title="Business News"
          >
            <i className="fas fa-briefcase"></i> Business
          </button>
          <button
            className={`topic-btn ${currentTopic === 'stock-market' ? 'active' : ''}`}
            onClick={() => onTopicChange?.('stock-market')}
            title="Stock Market"
          >
            <i className="fas fa-chart-line"></i> Markets
          </button>
          <button
            className={`topic-btn ${currentTopic === 'sports' ? 'active' : ''}`}
            onClick={() => onTopicChange?.('sports')}
            title="Sports"
          >
            <i className="fas fa-football-ball"></i> Sports
          </button>
          <button
            className={`topic-btn ${currentTopic === 'math' ? 'active' : ''}`}
            onClick={() => onTopicChange?.('math')}
            title="Math & Education"
          >
            <i className="fas fa-calculator"></i> Math
          </button>
        </div>
      </div>

      {/* Stories */}
      <div className="stories-container">
        {displayStories.length === 0 ? (
          <div className="empty-state">
            <p>No stories available. Please check your LLM configuration.</p>
          </div>
        ) : (
          displayStories.map((story) => (
            <div key={story.id} className="story-card">
              {story.imageUrl && (
                <img
                  src={story.imageUrl}
                  alt={story.headline}
                  className="story-image"
                />
              )}
              <div
                className="category-badge"
                style={{ backgroundColor: getCategoryColor(story.category) }}
              >
                {story.category.replace('-', ' ')}
              </div>
              <h2 className="story-headline">{story.headline}</h2>
              <p className="story-summary">{story.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* Navigation */}
      <div className="navigation-controls">
        <button
          className="icon-button"
          onClick={() => {
            console.log('[NewspaperPage] Previous button clicked, pageNumber:', pageNumber);
            onPreviousPage();
          }}
          disabled={pageNumber === 1}
          title="Previous page"
        >
          <i className="fas fa-chevron-left"></i>
        </button>

        <span className="page-info">
          Page {pageNumber}
        </span>

        <button
          className="icon-button"
          onClick={() => {
            console.log('[NewspaperPage] Next button clicked, pageNumber:', pageNumber, 'totalPages:', totalPages);
            onNextPage();
          }}
          title="Next page - load more stories"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

export default NewspaperPage;
