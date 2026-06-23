## Why

Building habits around reading news at an early age is crucial for developing informed, engaged citizens. Most kids today don't read newspapers, and when they do, adult-focused content is overwhelming. By creating a newspaper app tailored specifically for kids (ages 10-16) with curated, age-appropriate content focused on business and stock market news, we can make financial literacy engaging and accessible. The app helps kids understand real-world markets while building a consistent reading habit.

## What Changes

- New TypeScript application providing a newspaper-style interface specifically designed for kids
- Onboarding flow collecting kid profile (name, age) and LLM provider configuration (provider selection, API token)
- Automated LLM provider integration with dynamic model discovery and cost-optimization
- Newspaper-style UI with front page and successive pages mimicking traditional print layout
- AI-generated news content focused on business, stock market, and sports (in priority order)
- Country-specific stock market news customized based on kid's residence
- Page navigation system with forward/back arrows for browsing newspaper pages

## Capabilities

### New Capabilities

- `onboarding-setup`: First-time setup screen collecting kid profile (name, age), LLM provider selection (dropdown), API token input, and automatic model selection (fetching available models and selecting most economical option)
- `newspaper-ui`: Newspaper-style layout mimicking print newspapers with front page, successive pages, and visual hierarchy of news stories
- `news-content-generation`: AI-powered generation of age-appropriate news summaries focused on business, stock market, and sports topics
- `stock-market-localization`: Country-aware stock market news tailored to kid's residence, helping them understand their local/regional stock market
- `page-navigation`: Intuitive page browsing system with forward/back arrow controls for navigating through newspaper pages
- `llm-integration`: Dynamic LLM provider integration supporting multiple providers (OpenAI, Anthropic, etc.) with model discovery and cost-aware selection
- `content-filtering`: Strict content filtering ensuring news stays within business, stock market, and sports topics; excluding all other content

### Modified Capabilities

<!-- No existing capabilities modified in initial version -->

## Impact

- New frontend application (likely React/Vue or similar) with TypeScript
- Integration with multiple LLM providers (OpenAI, Anthropic, etc.) for content generation
- Database or storage layer for user profiles and generated content
- Content curation and filtering pipeline
- API layer for fetching real-time stock market data and news sources
- Potential third-party integrations: financial data APIs (stock prices), news APIs, LLM provider APIs
