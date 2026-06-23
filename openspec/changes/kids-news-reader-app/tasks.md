## 1. Project Setup

- [x] 1.1 Initialize Node.js/npm project with TypeScript configuration
- [x] 1.2 Set up monorepo structure with separate frontend and backend directories
- [x] 1.3 Install core dependencies (React, Express, TypeScript, testing libraries)
- [x] 1.4 Create build and development scripts (build, dev, test, lint)
- [x] 1.5 Set up ESLint and Prettier configuration for code style
- [x] 1.6 Initialize git repository and create .gitignore for secrets (API keys, tokens)

## 2. Backend Service Foundation

- [x] 2.1 Create Express.js application server with TypeScript
- [x] 2.2 Set up basic API routing structure
- [x] 2.3 Implement CORS configuration for frontend communication
- [x] 2.4 Create environment configuration system (load LLM provider credentials)
- [x] 2.5 Implement error handling and logging middleware
- [x] 2.6 Set up in-memory cache for newspaper pages (with TTL support)

## 3. LLM Provider Abstraction Layer

- [x] 3.1 Create `ILLMProvider` TypeScript interface with `listModels()` and `generateContent()` methods
- [x] 3.2 Implement `LLMFactory` to instantiate correct provider based on configuration
- [x] 3.3 Implement OpenAI provider adapter (`OpenAIProvider.ts`)
- [x] 3.4 Implement Anthropic provider adapter (`AnthropicProvider.ts`)
- [x] 3.5 Implement Cohere provider adapter (`CohereProvider.ts`)
- [x] 3.6 Create model pricing/cost calculation utility
- [x] 3.7 Write unit tests for provider factory and adapters
- [ ] 3.8 Test provider instantiation and API connectivity

## 4. Onboarding Configuration System

- [x] 4.1 Create TypeScript interface for child profile (name, age, country)
- [x] 4.2 Create TypeScript interface for LLM configuration (provider, apiToken, selectedModel)
- [x] 4.3 Implement client-side encryption utility for API token storage
- [x] 4.4 Create configuration persistence service (read/write from localStorage)
- [x] 4.5 Implement configuration validation (age range 10-16, non-empty names, valid API tokens)
- [x] 4.6 Create backend endpoint `/api/config/validate-token` to verify API token validity
- [x] 4.7 Create backend endpoint `/api/config/list-models` to fetch available models from LLM provider
- [x] 4.8 Implement model selection logic (select model with lowest cost)
- [x] 4.9 Write unit tests for configuration service and validation

## 5. Frontend - Onboarding UI

- [x] 5.1 Create React component for onboarding screen layout
- [x] 5.2 Implement text input field for child's name with validation
- [x] 5.3 Implement numeric input field for child's age (range validation 10-16)
- [x] 5.4 Create country selection component (dropdown or similar)
- [x] 5.5 Create LLM provider dropdown with OpenAI, Anthropic, Cohere options
- [x] 5.6 Implement secure text input for API token (masked input)
- [x] 5.7 Create "Save Configuration" button with loading state
- [x] 5.8 Implement error messaging for validation failures and API errors
- [x] 5.9 Add loading spinner/feedback while fetching models
- [x] 5.10 Display selected model name to user for transparency
- [x] 5.11 Style onboarding UI with age-appropriate design (colors, fonts, spacing)
- [ ] 5.12 Test onboarding flow end-to-end (configuration persistence, app navigation after setup)

## 6. Frontend - Newspaper UI Components

- [x] 6.1 Create main newspaper layout component (page container with navigation controls)
- [x] 6.2 Implement page number display (e.g., "Page 2 of 8")
- [x] 6.3 Create back arrow button component (left-aligned)
- [x] 6.4 Create forward arrow button component (right-aligned)
- [x] 6.5 Implement arrow button disable state (grayed out at page boundaries)
- [x] 6.6 Create newspaper story card component (headline, summary, category badge)
- [x] 6.7 Implement story grid/column layout for front page (multiple stories visible)
- [x] 6.8 Create typography styles for newspaper headlines (varying sizes)
- [ ] 6.9 Implement page transition animations (fade/slide between pages)
- [x] 6.10 Add responsive design for mobile/tablet (touch-friendly button sizes)
- [ ] 6.11 Create loading state component (when fetching new content)
- [ ] 6.12 Test newspaper UI rendering with sample data

## 7. Frontend - Navigation Logic

- [x] 7.1 Implement page navigation state management (current page, total pages)
- [x] 7.2 Create forward arrow click handler (increment page, fetch next page if needed)
- [x] 7.3 Create back arrow click handler (decrement page, fetch previous page if cached)
- [x] 7.4 Implement keyboard navigation (left/right arrow keys)
- [x] 7.5 Implement swipe gesture support (swipe left for next, swipe right for previous)
- [x] 7.6 Add page boundary checks (prevent navigation before first or after last page)
- [ ] 7.7 Write tests for navigation state transitions

## 8. Backend - Content Generation Pipeline

- [x] 8.1 Create service to fetch recent business/market news from open sources (NewsAPI, RSS feeds, or financial APIs)
- [x] 8.2 Create news filtering service to extract business and stock market relevant stories
- [x] 8.3 Create prompt engineering utility to build LLM system prompts with topic/age constraints
- [x] 8.4 Implement LLM content generation service (orchestrates news fetch → LLM call → formatting)
- [x] 8.5 Create story formatting service (structure output as headline + summary + category)
- [x] 8.6 Implement pagination logic (group stories into pages with configurable stories-per-page)
- [x] 8.7 Create cache key generation (based on child config, date)
- [x] 8.8 Write unit tests for content generation pipeline

## 9. Backend - Stock Market Localization

- [x] 9.1 Create country-to-stock-exchange mapping (US→S&P 500, India→SENSEX, UK→FTSE 100, etc.)
- [x] 9.2 Create currency mapping for countries
- [ ] 9.3 Implement country-aware news filtering (prioritize local company news)
- [ ] 9.4 Create stock market index/company data service (fetch current indices for child's country)
- [x] 9.5 Implement LLM prompt customization for country-specific stock market education
- [x] 9.6 Add localization context to content generation (include country in prompts)
- [x] 9.7 Write unit tests for localization logic

## 10. Backend - Content Filtering

- [ ] 10.1 Create content category classification service (identify topic: business, stock-market, sports, other)
- [ ] 10.2 Implement topic validation utility (ensure content is business/stock/sports only)
- [ ] 10.3 Create fallback content handling (if generated content violates filters, regenerate)
- [ ] 10.4 Implement content quality scoring (rate relevance to topic)
- [ ] 10.5 Create admin/review endpoint to log/analyze filtered content
- [ ] 10.6 Write unit tests for content filtering logic

## 11. Backend - API Endpoints

- [ ] 11.1 Implement `POST /api/config/save` endpoint (save child profile and LLM config)
- [ ] 11.2 Implement `GET /api/config/check` endpoint (check if configuration exists)
- [x] 11.3 Implement `GET /api/newspaper/page/:pageNum` endpoint (fetch page content)
- [x] 11.4 Implement `GET /api/newspaper/regenerate` endpoint (force content regeneration)
- [x] 11.5 Implement `GET /api/models/list` endpoint (list available models for provider)
- [x] 11.6 Add request rate limiting middleware
- [x] 11.7 Write integration tests for API endpoints

## 12. Frontend - Configuration Management

- [x] 12.1 Implement configuration check on app startup (determine if onboarding needed)
- [x] 12.2 Create conditional rendering (show onboarding or newspaper based on config status)
- [x] 12.3 Implement configuration loading from API on app startup
- [ ] 12.4 Create configuration update service for future use (edit settings)
- [ ] 12.5 Test configuration persistence across app restarts

## 13. Frontend - Newspaper Content Display

- [x] 13.1 Create service to fetch newspaper pages from backend
- [x] 13.2 Implement page caching on client side (avoid refetch for recent pages)
- [x] 13.3 Create loading states for async content fetching
- [x] 13.4 Implement error handling and retry logic for failed page loads
- [x] 13.5 Create empty state UI (if no content available)
- [ ] 13.6 Test content display with various page sizes and screen sizes

## 14. Security & Token Management

- [ ] 14.1 Implement AES encryption for API token storage in localStorage
- [ ] 14.2 Create secure token retrieval mechanism (decrypt on use)
- [ ] 14.3 Add HTTPS enforcement for production
- [ ] 14.4 Implement Content Security Policy (CSP) headers
- [ ] 14.5 Create documentation for security best practices
- [ ] 14.6 Test token encryption/decryption roundtrip

## 15. Testing - Unit Tests

- [ ] 15.1 Write unit tests for onboarding configuration service
- [ ] 15.2 Write unit tests for LLM provider factory and adapters
- [ ] 15.3 Write unit tests for model cost calculation
- [ ] 15.4 Write unit tests for content generation pipeline
- [ ] 15.5 Write unit tests for localization logic
- [ ] 15.6 Write unit tests for content filtering
- [ ] 15.7 Write unit tests for pagination logic
- [ ] 15.8 Achieve minimum 80% code coverage for critical paths

## 16. Testing - Integration Tests

- [ ] 16.1 Test onboarding flow (name → age → provider → API token → model selection → persistence)
- [ ] 16.2 Test newspaper page navigation (back arrow, forward arrow, boundary conditions)
- [ ] 16.3 Test LLM content generation end-to-end (fetch news → call LLM → format → display)
- [ ] 16.4 Test country-specific stock market content generation
- [ ] 16.5 Test content filtering (verify non-allowed topics are excluded)
- [ ] 16.6 Test configuration persistence across app restarts
- [ ] 16.7 Test error scenarios (invalid API token, LLM API downtime, no content available)

## 17. Documentation & Cleanup

- [x] 17.1 Create README with project overview and architecture diagram
- [x] 17.2 Document LLM provider setup instructions (how to get API keys)
- [x] 17.3 Document backend API specification (endpoints, request/response formats)
- [x] 17.4 Create developer setup guide (how to run locally)
- [x] 17.5 Document environment variables and configuration
- [ ] 17.6 Create deployment guide for production
- [ ] 17.7 Remove debug logging and console.logs
- [ ] 17.8 Code review and cleanup (remove unused imports, dead code)

## 18. Build & Deployment

- [ ] 18.1 Configure production build process (minify, tree-shake)
- [ ] 18.2 Create Docker configuration for backend service
- [ ] 18.3 Set up deployment pipeline (CI/CD)
- [ ] 18.4 Create database/storage setup (if using external cache/DB)
- [ ] 18.5 Test production build locally
- [ ] 18.6 Performance testing (page load times, LLM response times)

## 19. Polish & Edge Cases

- [x] 19.1 Handle network disconnection gracefully
- [x] 19.2 Test with various device screen sizes (mobile, tablet, desktop)
- [ ] 19.3 Test with different LLM providers
- [ ] 19.4 Test with various countries and stock markets
- [ ] 19.5 Verify age-appropriate language and content
- [ ] 19.6 Performance optimization (reduce bundle size, optimize LLM prompts)
- [x] 19.7 Accessibility testing (keyboard navigation, screen readers, color contrast)
- [ ] 19.8 User acceptance testing with target age group (optional)

## 20. Deployment & Launch

- [ ] 20.1 Final security audit
- [ ] 20.2 Load testing with expected concurrent users
- [ ] 20.3 Deploy to production environment
- [ ] 20.4 Monitor LLM API costs and set up alerts
- [ ] 20.5 Monitor application error rates and performance metrics
- [ ] 20.6 Create runbook for troubleshooting common issues
