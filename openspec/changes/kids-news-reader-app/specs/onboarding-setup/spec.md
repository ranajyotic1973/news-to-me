## ADDED Requirements

### Requirement: First-time onboarding flow
The system SHALL display a setup screen on first launch that collects essential configuration for the child user and LLM provider.

#### Scenario: Initial app launch shows onboarding
- **WHEN** app launches for the first time
- **THEN** onboarding setup screen is displayed instead of the main newspaper interface

#### Scenario: Collect child name
- **WHEN** user is on the onboarding screen
- **THEN** there is a text input field for entering the child's name (required field)

#### Scenario: Collect child age
- **WHEN** user is on the onboarding screen
- **THEN** there is a numeric input field for entering the child's age (required field, valid range 10-16)

### Requirement: LLM provider configuration
The system SHALL allow users to select an LLM provider and provide authentication credentials.

#### Scenario: Select LLM provider
- **WHEN** user is on the onboarding screen
- **THEN** there is a dropdown menu showing available LLM providers (OpenAI, Anthropic, Cohere, etc.)

#### Scenario: Input API token
- **WHEN** user is on the onboarding screen
- **THEN** there is a secure text input field for entering the LLM provider's API token

### Requirement: Automatic model selection
The system SHALL fetch available models from the selected provider and automatically select the most economical model.

#### Scenario: Save configuration triggers model fetch
- **WHEN** user clicks the "Save" button after entering name, age, provider, and API token
- **THEN** the system fetches available models from the selected LLM provider using the provided API token

#### Scenario: Most economical model selected
- **WHEN** model fetch completes successfully
- **THEN** the system analyzes model pricing and automatically selects the model with the lowest cost per token

#### Scenario: Configuration persisted
- **WHEN** model selection completes
- **THEN** the system persists the child profile (name, age) and LLM configuration (provider, API token, selected model) to local storage

#### Scenario: Onboarding completion navigates to main app
- **WHEN** configuration is persisted successfully
- **THEN** the system navigates to the main newspaper interface

### Requirement: Skip onboarding if configured
The system SHALL not display onboarding if configuration is already present.

#### Scenario: Subsequent launch skips onboarding
- **WHEN** app launches and valid configuration exists in local storage
- **THEN** onboarding screen is skipped and main newspaper interface is displayed directly
