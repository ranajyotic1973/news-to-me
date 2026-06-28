## ADDED Requirements

### Requirement: Backend bundled as standalone executable
The system SHALL package the Node.js backend server as a standalone executable that does not require Node.js to be installed on the user's machine.

#### Scenario: Backend executable is created
- **WHEN** the build process runs
- **THEN** a standalone backend executable (e.g., backend.exe) is generated

#### Scenario: Backend executable runs without Node.js
- **WHEN** the backend executable is launched
- **THEN** it starts successfully without requiring Node.js to be installed on the system

#### Scenario: Backend bundled with assets
- **WHEN** the backend executable starts
- **THEN** all required backend assets, configuration files, and dependencies are available (bundled within the executable)

### Requirement: Frontend built as optimized static assets
The system SHALL build the React frontend as optimized, minified static assets ready for serving from the backend.

#### Scenario: Frontend assets are built
- **WHEN** the build process runs
- **THEN** the React application is compiled and minified to dist/frontend/ (or similar directory)

#### Scenario: Frontend assets are production-optimized
- **WHEN** frontend build completes
- **THEN** output includes minified JavaScript, CSS, and HTML suitable for production use

### Requirement: Complete application bundled in Electron
The system SHALL bundle the backend executable, frontend assets, and Electron main process into a single installable application.

#### Scenario: Electron app package includes all components
- **WHEN** the Electron application is packaged
- **THEN** the application bundle includes:
  - Electron runtime
  - Backend executable
  - Frontend static assets
  - Application icon and metadata

#### Scenario: Application can run offline
- **WHEN** the application is installed and launched
- **THEN** all backend functionality and frontend assets are available without requiring external downloads or network access (except for external API calls if applicable)

### Requirement: Build process orchestration
The system SHALL provide a single build command that orchestrates backend bundling, frontend building, and Electron packaging.

#### Scenario: Single build command
- **WHEN** npm run build is executed
- **THEN** all components (backend executable, frontend assets, Electron package) are built in the correct sequence

#### Scenario: Build produces distributable artifact
- **WHEN** build completes
- **THEN** installer (.exe) is ready for distribution without additional manual steps
