## Why

Currently, the News To Me application requires manual setup and running the backend and UI separately, creating friction for end users. Packaging the application as a single, installable desktop application with automatic backend startup dramatically improves the user experience and reduces deployment complexity.

## What Changes

- Create a unified Electron-based desktop installer that bundles both backend and frontend into a single application package
- Implement automatic backend service startup when the application launches
- Add desktop icons and start menu entries for easy access
- Launch the UI in the default browser automatically after backend is ready
- Package the application for distribution with a single install wizard

## Capabilities

### New Capabilities
- `desktop-installer`: Create and distribute a Windows installer (.exe) for the News To Me application
- `application-bundler`: Bundle the backend server and frontend UI into a single Electron application
- `backend-launcher`: Automatically start the backend service when the desktop application launches
- `browser-integration`: Detect backend readiness and automatically launch the UI in the default system browser
- `desktop-shortcuts`: Create desktop icons and start menu entries for quick application access

### Modified Capabilities
<!-- None - all existing code remains unchanged; this is purely additive packaging -->

## Impact

- **Code**: Backend HTTP server configuration may need minor adjustments for localhost-only binding; frontend URL configuration for local backend
- **Dependencies**: Added Electron and electron-builder for desktop packaging; might add small utilities for process management and browser detection
- **User Experience**: End users now install and run via a single .exe; no command line knowledge required
- **Distribution**: Application becomes distributable via installer (.exe) rather than requiring developer setup
