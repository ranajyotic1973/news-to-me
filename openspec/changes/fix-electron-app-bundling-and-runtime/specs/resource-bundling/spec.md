## ADDED Requirements

### Requirement: Package includes all backend dependencies

All npm packages and Node.js built-in modules required by the backend SHALL be included in the bundled executable, without relying on external node_modules.

#### Scenario: Express.js is bundled
- **WHEN** backend executable runs
- **THEN** Express.js and all its dependencies are available within the bundled binary

#### Scenario: Crypto modules are included
- **WHEN** backend needs to encrypt/decrypt API tokens
- **THEN** TweetNaCl and crypto dependencies are available without external installation

#### Scenario: Optional dependencies are evaluated
- **WHEN** backend initializes
- **THEN** only truly required dependencies are bundled; optional features gracefully degrade if dependencies are missing

### Requirement: Asset files are accessible at runtime

Configuration templates, locale files, and other asset files SHALL be discoverable by the bundled backend using relative paths.

#### Scenario: LLM templates are available
- **WHEN** backend initializes prompt templates
- **THEN** template files are found and loaded without path errors

#### Scenario: Locale files are bundled
- **WHEN** backend references locale or configuration data
- **THEN** files are accessible from the bundled package

### Requirement: Snapshot and compression configuration

The pkg bundler configuration SHALL be optimized to capture all dependencies and compress the output using Brotli.

#### Scenario: pkg uses compress option
- **WHEN** building the backend executable
- **THEN** output is compressed with Brotli reducing executable size by 30-40%

#### Scenario: pkg snapshots include all modules
- **WHEN** bundling backend
- **THEN** pkg snapshot captures all require() calls and module references

### Requirement: Platform-specific binaries

Separate optimized binaries SHALL be created for Windows, macOS (Intel), macOS (Apple Silicon), and Linux architectures.

#### Scenario: Windows binary includes Windows modules
- **WHEN** building Windows .exe
- **THEN** Windows-specific Node native modules are included

#### Scenario: macOS binaries support both architectures
- **WHEN** building macOS packages
- **THEN** both arm64 and x64 binaries are created and included in universal app

#### Scenario: Linux binary includes Linux dependencies
- **WHEN** building Linux AppImage
- **THEN** Linux-specific system libraries and binaries are available
