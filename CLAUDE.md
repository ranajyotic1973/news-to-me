# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-based project built with modular, single-responsibility architecture and AI-driven workflows.

## Tech Stack

- **Language**: TypeScript (primary)
- **AI Integration**: Agentic AI methodology for complex workflows
- **Tooling**: Local open-source libraries (prioritized over external APIs to reduce token counts)
- **Data Retrieval**: RAG (Retrieval-Augmented Generation) where necessary

## Code Architecture & Principles

### Modularity & Single Responsibility
- Each class encapsulates a single resource and its related functionality
- Avoid cross-cutting concerns; use composition and dependency injection instead of shared utilities
- Separate concerns: data access, business logic, and API layers should be independent modules

### AI & Workflow Design
- Use **agentic AI methodology** to decompose complex workflows into smaller, independent agents
- Run parallel workflows concurrently to improve performance
- Chain agents together by passing AI message responses from one agent as input to the next
- Keep system prompts focused and minimal for each agent
- Prefer **local open-source tooling** (e.g., local embeddings, local LLMs) to reduce API token consumption
- Implement **RAG** (Retrieval-Augmented Generation) patterns where enhanced context improves response quality

### Design Patterns
- Leverage well-known design patterns (Factory, Strategy, Observer, Repository, etc.)
- Apply SOLID principles rigorously
- Use dependency injection for testability and loose coupling

## Development Workflow

### Testing
- **Write unit tests first** for all functional code
- Unit tests define the contract; implementation follows the tests
- **Only modify source code to fix genuine bugs or implement missing functions**—never change code just to make tests pass
- Each test should be independent and focused on a single behavior

### Common Commands

Add these commands once the project build system is established:

```bash
# Build the project
npm run build

# Run all tests
npm test

# Run a single test file
npm test -- <test-file>

# Run tests in watch mode
npm test -- --watch

# Lint the codebase
npm run lint

# Type check (TypeScript)
npm run type-check
```

## File Structure (Template)

```
src/
  agents/           # Agentic AI components
  services/         # Business logic & domain services
  repositories/     # Data access layer
  types/            # TypeScript interfaces & types
  utils/            # Local open-source tool wrappers
tests/
  unit/             # Unit test suite
  integration/      # Integration tests (if needed)
```

## Key Coding Standards

1. **Single Resource Per Class**: A `UserService` manages users; a `PostService` manages posts. No mixing.
2. **No Cross-Cutting Code**: Use composition and middleware instead of shared utility functions.
3. **Agent Parallelization**: When multiple independent agents can run in parallel, structure them that way.
4. **Message Chaining**: Pass structured AI responses (as JSON or typed objects) between agents.
5. **Token Efficiency**: Favor local tooling over API calls; use RAG to provide context without embedding entire datasets.

## References

Refer to this CLAUDE.md and the provided coding rules when making architectural decisions or writing new modules.
