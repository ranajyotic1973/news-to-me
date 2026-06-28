## MODIFIED Requirements

### Requirement: Spawn backend process with error capture

The Electron main process SHALL spawn the bundled backend executable as a child process with proper error handling and stderr/stdout capture for diagnostics.

#### Scenario: Backend process is launched with error handling
- **WHEN** Electron main process initializes
- **THEN** backend executable is spawned with error event listeners and process.on('error') handlers

#### Scenario: Backend errors are captured and logged
- **WHEN** backend writes to stderr
- **THEN** output is captured, logged to application log file, and stored for error reporting

#### Scenario: Exit code is checked
- **WHEN** backend process exits unexpectedly
- **THEN** exit code is checked and appropriate error dialog is shown to user

### Requirement: Health check with retry and timeout

Before launching the browser UI, the main process SHALL verify backend readiness by polling the /health endpoint with configurable retries and timeout.

#### Scenario: Health checks occur before UI launch
- **WHEN** backend claims to be ready
- **THEN** main process polls /health endpoint at least 3 times before declaring backend ready

#### Scenario: Timeout prevents indefinite wait
- **WHEN** backend does not respond to health checks
- **THEN** after 10 second timeout, error dialog is shown with message asking user to check configuration

#### Scenario: Successful health check triggers UI
- **WHEN** health check receives 200 response with valid payload
- **THEN** browser is automatically launched to http://localhost:3173 (or configured frontend port)

### Requirement: Error dialog with diagnostic information

When backend fails to start, user SHALL see a dialog with the actual error message and relevant diagnostic information.

#### Scenario: Error dialog displays stderr
- **WHEN** backend fails to start
- **THEN** user sees an error dialog showing the backend's stderr output

#### Scenario: Suggestions are provided
- **WHEN** specific error patterns are detected (e.g., port conflict, missing files)
- **THEN** dialog includes actionable suggestion (e.g., "Close other News To Me instances" or "Reinstall the application")

### Requirement: Graceful shutdown of child processes

When Electron main process exits, any spawned backend process SHALL be terminated cleanly.

#### Scenario: Backend process is killed on app exit
- **WHEN** user closes the application window
- **THEN** backend child process is terminated (process.kill()) and resources are released
