## Why

The current packaged application has runtime errors when Node.js is not installed or available in the system PATH. This defeats the purpose of bundling the application - users should be able to run it without any external dependencies. The backend bundling approach (using `pkg`) may not be correctly handling all runtime dependencies and file resources, causing JavaScript errors during startup.

## What Changes

- Improve backend bundling to ensure all dependencies and assets are included correctly
- Ensure backend executable works standalone without requiring Node.js
- Add proper error handling and logging for startup failures
- Bundle all required files (config, assets, locales) with the backend
- Improve Electron's process management and error detection for bundled backend
- Ensure the application works completely offline after installation

## Capabilities

### New Capabilities
- `standalone-backend`: Backend runs as a completely standalone executable without Node.js dependency
- `offline-operation`: Application runs completely offline after installation without external dependencies
- `improved-error-handling`: Clear error messages when components fail to start
- `resource-bundling`: All required resources (config files, assets) bundled with application

### Modified Capabilities
- `backend-launcher`: Enhanced to properly handle standalone backend executable and report errors
- `application-bundler`: Improved to ensure no external Node.js dependency required

## Impact

- **Code**: Backend startup code needs error handling improvements; resource paths need to be relative to bundled app
- **Dependencies**: `pkg` library usage optimized; may need additional bundling tools for resources
- **User Experience**: Application works immediately after installation without missing dependencies
- **Installation**: Produces smaller, more reliable installers with no Node.js prerequisite
