## ADDED Requirements

### Requirement: Backend launches automatically on app start
The system SHALL start the backend server automatically when the desktop application launches, without requiring user intervention.

#### Scenario: Backend starts when application launches
- **WHEN** user opens the News To Me application
- **THEN** the backend server is automatically started as a child process

#### Scenario: Backend is ready before browser launch
- **WHEN** the backend process is spawned
- **THEN** the application waits for the backend to be ready before proceeding to launch the browser UI

### Requirement: Backend uses dynamic port allocation
The system SHALL allocate an available network port dynamically at startup to ensure no port conflicts.

#### Scenario: Port is automatically selected
- **WHEN** the backend starts
- **THEN** the operating system assigns an available port (e.g., port 0 results in automatic selection)

#### Scenario: Port is communicated to frontend
- **WHEN** the backend is ready
- **THEN** the port number is made available to the browser/UI process (via environment variable, config file, or IPC)

### Requirement: Backend cleanup on application exit
The system SHALL terminate the backend process when the desktop application closes, ensuring no orphaned processes remain.

#### Scenario: Backend stops when application closes
- **WHEN** user closes the desktop application window
- **THEN** the backend server process is terminated cleanly

#### Scenario: No orphaned processes
- **WHEN** application closes
- **THEN** the backend child process does not continue running in the background

### Requirement: Backend startup error handling
The system SHALL gracefully handle backend startup failures and notify the user.

#### Scenario: Backend fails to start
- **WHEN** the backend process fails to launch
- **THEN** the application shows an error dialog to the user with a helpful message

#### Scenario: Error prompts retry or exit
- **WHEN** an error dialog is shown
- **THEN** the user can choose to retry or close the application

### Requirement: Backend environment configuration
The system SHALL configure the backend process with appropriate environment variables for running as a bundled application.

#### Scenario: Backend knows it's running in desktop app
- **WHEN** the backend starts
- **THEN** environment variables indicate it's running in an Electron environment (e.g., NODE_ENV=production, DESKTOP_APP=true)
