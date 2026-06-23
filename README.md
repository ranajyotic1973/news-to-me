# News to Me 📰

A newspaper app for kids aged 10-16 that combines AI-powered content generation with stock market education. The app presents business and financial news in a newspaper-style format, customized by age and country.

## Features

- **AI-Generated News**: Uses LLM providers (OpenAI, Anthropic, Cohere) to generate age-appropriate news summaries
- **Stock Market Focus**: Emphasizes financial literacy with country-specific stock market indices
- **Newspaper UI**: Traditional newspaper layout with page navigation
- **Multi-LLM Support**: Choose your preferred LLM provider and automatically select the most economical model
- **Localized Content**: Market data, currency, and news tailored to the child's country
- **Content Filtering**: Strict topic filtering ensures only business, stock market, and sports news

## Architecture

```
news-to-me/
├── src/
│   ├── backend/          # Express.js server
│   │   ├── services/     # Business logic
│   │   │   ├── llm/      # LLM provider integrations
│   │   │   ├── news/     # News fetching & filtering
│   │   │   └── ...       # Content generation, localization
│   │   ├── routes/       # API endpoints
│   │   └── utils/        # Config, cache
│   ├── frontend/         # React app
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Screen layouts
│   │   ├── services/     # Frontend services
│   │   └── styles/       # CSS styling
│   └── shared/           # Shared types & interfaces
├── package.json          # Dependencies & scripts
└── CLAUDE.md            # Developer guidelines
```

## Tech Stack

- **Language**: TypeScript
- **Frontend**: React 18 + Vite
- **Backend**: Express.js
- **LLM Integration**: Multi-provider support (OpenAI, Anthropic, Cohere)
- **Testing**: Vitest + React Testing Library
- **Security**: TweetNaCl for AES encryption

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- API keys from at least one LLM provider:
  - [OpenAI API](https://platform.openai.com/api-keys)
  - [Anthropic API](https://console.anthropic.com/)
  - [Cohere API](https://dashboard.cohere.com/)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

   This runs:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Development Commands

```bash
npm run build              # Build both frontend and backend
npm run dev               # Run frontend + backend concurrently
npm run dev:backend       # Backend only (with hot reload)
npm run dev:frontend      # Frontend only (with hot reload)
npm test                  # Run test suite
npm run lint              # Check code style
npm run format            # Auto-format code
npm run type-check        # Check TypeScript types
```

## API Documentation

### Configuration Endpoints

#### `POST /api/config/validate-token`
Validate LLM provider API token and fetch available models.

**Request**:
```json
{
  "provider": "openai",
  "apiToken": "sk-..."
}
```

**Response**:
```json
{
  "valid": true,
  "models": [
    {
      "id": "gpt-4o",
      "name": "gpt-4o",
      "inputCostPer1mTokens": 5,
      "outputCostPer1mTokens": 15
    }
  ]
}
```

#### `GET /api/config/list-models?provider=openai&apiToken=sk-...`
List available models and get the most economical recommendation.

**Response**:
```json
{
  "models": [...],
  "recommended": {
    "id": "gpt-3.5-turbo",
    "inputCostPer1mTokens": 0.5,
    "outputCostPer1mTokens": 1.5
  }
}
```

#### `GET /api/config/providers`
Get list of supported LLM providers.

**Response**:
```json
{
  "providers": ["openai", "anthropic", "cohere"]
}
```

### Newspaper Endpoints

#### `GET /api/newspaper/page/:pageNum`
Fetch a specific newspaper page with AI-generated news.

**Query Parameters**:
- `childAge`: Age of child (10-16)
- `childCountry`: Country name
- `provider`: LLM provider
- `apiToken`: API token
- `modelId`: Selected model ID

**Response**:
```json
{
  "pageNumber": 1,
  "totalPages": 3,
  "stories": [
    {
      "id": "story-1",
      "headline": "Tech Company Reports Record Growth",
      "summary": "A leading technology company announced its best quarter...",
      "category": "business"
    }
  ]
}
```

#### `GET /api/newspaper/regenerate`
Clear cached content to force regeneration on next request.

## Getting API Keys

### OpenAI

1. Visit [platform.openai.com](https://platform.openai.com/account/api-keys)
2. Click "Create new secret key"
3. Copy and keep it safe

### Anthropic

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Navigate to API keys section
3. Create new API key

### Cohere

1. Visit [dashboard.cohere.com](https://dashboard.cohere.com/api-keys)
2. Create new API key

### xAI (Grok)

1. Visit [x.ai/api](https://x.ai/api)
2. Sign up or log in
3. Generate API key from dashboard

### Google Gemini

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy the key

## Project Structure

### Key Services

- **LLMFactory**: Creates provider instances based on configuration
- **ContentGenerationService**: Orchestrates news fetch → LLM generation → formatting
- **NewsFilteringService**: Categorizes and prioritizes content by topic
- **StoryFormattingService**: Parses LLM output into structured stories
- **StockMarketLocalization**: Maps countries to their stock exchanges and currencies
- **EncryptionService**: Securely stores API tokens in browser localStorage

### Frontend Flow

1. **App.tsx**: Checks if configured, shows OnboardingScreen or NewspaperApp
2. **OnboardingScreen**: Multi-step setup (name/age → LLM provider → model selection)
3. **NewspaperApp**: Main app displaying newspapers with page navigation
4. **NewspaperPage**: Individual page with stories and navigation controls

## Supported Countries & Stock Markets

- **US**: S&P 500 ($)
- **India**: SENSEX (₹)
- **UK**: FTSE 100 (£)
- **Germany**: DAX (€)
- **Japan**: Nikkei 225 (¥)
- **Canada**: S&P/TSX (C$)
- **Australia**: ASX 200 (A$)
- **Brazil**: Ibovespa (R$)

(More countries can be added to `StockMarketLocalization.ts`)

## Content Filtering

The app strictly filters content to **only**:
- Business news (companies, industries, corporate announcements)
- Stock market news (stocks, indices, investing, market trends)
- Sports news (teams, games, athletes)

All other topics are automatically excluded.

## Security

- **API Tokens**: Encrypted with AES-256 using TweetNaCl, stored in browser localStorage
- **CORS**: Enabled for development, configurable for production
- **Input Validation**: All user inputs validated on both frontend and backend
- **TypeScript**: Strict mode enabled for type safety

## Testing

```bash
npm test                    # Run all tests
npm run test:ui            # Interactive test UI
```

Test coverage includes:
- LLM provider factory and adapters
- Configuration services
- News filtering and categorization
- Story formatting and pagination
- Stock market localization
- Encryption/decryption

## Deployment

### Build for Production

```bash
npm run build
```

Output:
- Frontend: `dist/frontend/`
- Backend: `dist/backend/`

### Environment Variables

```bash
NODE_ENV=production
PORT=5000
# LLM credentials configured via UI, not env
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <pid> /F
```

### TypeScript Errors

```bash
npm run type-check    # Full type check
npm run lint:fix      # Auto-fix style issues
```

### Invalid API Token

- Verify token in dashboard of your LLM provider
- Check token hasn't expired
- Use `/api/config/validate-token` to test

## Contributing

1. Follow TypeScript + ESLint standards (run `npm run lint`)
2. Write tests for new functionality
3. Ensure all tests pass: `npm test`
4. Keep components modular (one resource per service)

## License

ISC

---

Built with ❤️ for kids who want to understand the world of finance.
