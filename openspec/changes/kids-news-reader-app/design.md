## Context

This is a new greenfield application for children aged 10-16 focused on building newspaper reading habits around business and stock market news. The app requires multi-LLM provider support with dynamic model selection, age-appropriate content generation, country-specific stock market customization, and a newspaper-style UI.

Key constraints:
- Must support multiple LLM providers (OpenAI, Anthropic, Cohere, etc.)
- All content must be generated via LLM (not static data)
- Must be engaging and accessible to target age group
- Stock market news must be country-aware and localized
- TypeScript primary language (per CLAUDE.md)
- Modular architecture with single responsibility per component

## Goals / Non-Goals

**Goals:**
- Create an engaging newspaper-style interface for kids that encourages reading habits
- Support first-time onboarding with LLM provider configuration
- Automatically fetch and select cost-optimized LLM models
- Generate age-appropriate, highly localized stock market news
- Provide smooth page-based navigation with arrow controls
- Ensure strict content filtering (business, stock market, sports only)
- Build modular, testable components following CLAUDE.md principles

**Non-Goals:**
- Real-time market data feeds (content is LLM-generated based on news sources, not live trading data)
- User accounts or cross-device synchronization (single-device, local storage only)
- Multi-language support (initially single language based on region)
- Push notifications or alerts
- Social features or sharing capabilities
- Advanced analytics or parental controls beyond age filtering

## Decisions

### 1. Frontend Framework: React with TypeScript
**Decision**: Use React for the frontend UI with TypeScript for type safety.
**Rationale**: React provides component-based architecture aligned with CLAUDE.md modularity principles. TypeScript ensures type safety and catches errors early.
**Alternatives considered**:
- Vue.js: Simpler syntax but React ecosystem is larger
- Svelte: Lighter but smaller community and third-party library support
- Plain HTML/JavaScript: Would be difficult to maintain and scale

### 2. Backend Architecture: Monolithic Node.js/Express Service
**Decision**: Single Node.js/Express backend service handling all business logic.
**Rationale**: For initial launch, a monolithic approach reduces operational complexity. Single codebase, straightforward deployment, sufficient performance for expected load.
**Alternatives considered**:
- Microservices: Added complexity and latency not needed initially
- Serverless (AWS Lambda): Overkill for content generation workload
- Direct browser-to-LLM integration: Exposes API keys to client, security risk

### 3. LLM Provider Abstraction Layer
**Decision**: Implement a provider abstraction interface allowing pluggable LLM implementations.
**Rationale**: Supports multi-provider requirement. Each provider (OpenAI, Anthropic, Cohere) gets an adapter implementing a common `ILLMProvider` interface with `listModels()` and `generateContent()` methods.
**Rationale for abstraction**: Reduces coupling between business logic and specific LLM APIs. Simplifies testing and provider switching.
**File structure**:
```
src/services/llm/
  ├── ILLMProvider.ts (interface)
  ├── providers/
  │   ├── OpenAIProvider.ts
  │   ├── AnthropicProvider.ts
  │   └── CohereProvider.ts
  └── LLMFactory.ts (creates correct provider instance)
```

### 4. Onboarding Configuration Storage
**Decision**: Store onboarding configuration (child profile, LLM settings) in browser localStorage.
**Rationale**: No backend database needed for configuration. Faster setup, simpler deployment. Configuration is device-specific and not user-private.
**Security consideration**: API tokens are encrypted in localStorage using a client-side encryption library (e.g., TweetNaCl.js).
**Alternatives considered**:
- Cloud backend storage: Adds complexity, privacy considerations for children
- Plain localStorage (no encryption): API key exposure risk if device is compromised

### 5. Content Generation Pipeline
**Decision**: Backend service orchestrates fetching news summaries → prompting LLM → formatting for display.
**Flow**:
1. Frontend requests newspaper content
2. Backend fetches recent business/market news from open sources (NewsAPI, RSS feeds, or financial data APIs)
3. Backend sends curated news summaries + instruction prompt to configured LLM
4. LLM generates age-appropriate summaries with business/stock focus
5. Backend formats and paginates results into newspaper pages
6. Frontend displays formatted pages

**Rationale**: Centralizes content generation logic, easier to iterate on prompts, maintains consistent formatting.

### 6. Localization Strategy: Country Detection + Configuration
**Decision**: Store country/region in child profile during onboarding; use it to customize all content.
**Rationale**: Enables stock market localization (local indices, local companies). Can be extended to support future features (local news sources, currency).
**Country data storage**: Stored with child profile in configuration.
**Stock market mapping**: Backend maintains mapping of countries → primary stock exchange/index (US→S&P 500, India→SENSEX, etc.).

### 7. Content Caching and Freshness
**Decision**: Cache generated newspaper pages for 24 hours; regenerate on expiry.
**Rationale**: Reduces LLM API calls (cost), ensures fresh content daily, aligns with newspaper metaphor (new edition daily).
**Storage**: Backend in-memory or Redis cache with TTL.
**Alternatives considered**:
- No caching: High API costs, poor UX (slow page loads)
- Persistent database: Over-engineered for first version

### 8. Page Pagination Approach
**Decision**: Server-side pagination: backend generates fixed number of stories per page (e.g., 3-4 stories/page).
**Rationale**: Matches newspaper metaphor, prevents infinite scroll fatigue, simplifies navigation logic.
**Page structure**: Each page is a complete JSON object with `{ pageNumber, totalPages, stories: [...] }`

### 9. Styling and UI Components
**Decision**: Use a CSS-in-JS library (e.g., styled-components, Tailwind CSS) with accessible component library (e.g., Headless UI, Radix UI).
**Rationale**: Maintains single codebase for styling, ensures consistency, Tailwind provides rapid development for print-inspired layouts.
**Accessibility**: WCAG 2.1 AA compliance for touch targets (arrow buttons), semantic HTML, color contrast.

## Risks / Trade-offs

### Risk: LLM API Costs
**Impact**: Unpredictable usage could lead to high costs if a user asks for lots of content regeneration.
**Mitigation**: 
- Implement request rate limiting per child profile
- Daily cache reuse reduces regeneration
- Monitor costs closely, set spending alerts
- Consider usage analytics to optimize prompt efficiency

### Risk: Content Quality Variance
**Impact**: LLM output may occasionally fail to filter topics correctly or generate age-inappropriate content.
**Mitigation**:
- Robust system prompts with explicit topic and age constraints
- Implement optional moderation layer (review by humans or moderation API)
- Clear error handling when content doesn't meet quality thresholds
- Ability to regenerate if content is poor

### Risk: Stock Market Data Accuracy
**Impact**: If generated news is based on outdated or incorrect news sources, children learn wrong information.
**Mitigation**:
- Validate news sources (use reputable APIs, cross-check data)
- Emphasize to children that this is educational, not investment advice
- Include clear timestamps and attribution
- Periodic review of generated content accuracy

### Risk: API Token Security
**Impact**: If client-side token storage is compromised, LLM provider account could be accessed.
**Mitigation**:
- Client-side encryption of tokens in localStorage
- Implement token rotation capability
- Clear security warnings during onboarding
- Consider backend token relay (backend stores/manages tokens instead of client)

### Risk: Provider API Downtime
**Impact**: If child's selected LLM provider is down, app cannot generate content.
**Mitigation**:
- Implement fallback to cached content
- Display user-friendly error messages
- Consider multi-provider fallback (if primary provider fails, try secondary)
- Graceful degradation instead of complete outage

### Trade-off: Client-side Token Storage vs Backend Token Management
**Trade-off**: Storing tokens client-side is simpler but less secure; backend management is more complex but more secure.
**Current Decision**: Client-side with encryption. Can be revisited for production if security requirements change.

### Trade-off: Real-time vs Daily Content
**Trade-off**: Real-time content generation every refresh costs more and is slower; daily cache is cheaper and faster but less "live".
**Current Decision**: Daily cache with on-demand regeneration option. Children don't need real-time updates; daily newspaper aligns with use case.

## Open Questions

1. **News Data Sources**: Should we integrate with newsAPI.org, financial data APIs, or rely on the LLM's training data? 
   - Decision needed: Explicit news source integration vs LLM knowledge cutoff
2. **Multi-language Support**: Initial release for single language/region, but should architecture support future multi-language?
   - Decision needed: Design for internationalization now or defer?
3. **Parental Oversight**: Should parents be able to review what the child is reading or access activity logs?
   - Decision needed: Scope for v1 or future feature?
4. **Model Selection**: Beyond cost, should we consider model capabilities (reasoning, accuracy)? 
   - Decision needed: Pure cost optimization or multi-factor selection?
5. **Content Moderation**: Should v1 include automated content review, or rely solely on prompt engineering?
   - Decision needed: Trade-off between costs and safety.
