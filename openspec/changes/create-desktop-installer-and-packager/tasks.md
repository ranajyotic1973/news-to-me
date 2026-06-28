## 1. Setup & Dependencies

- [x] 1.1 Add electron-builder dependencies to package.json (already have Electron)
- [x] 1.2 Add process management libraries (cross-spawn, find-free-port)
- [x] 1.3 Add browser launch library (open or similar)
- [x] 1.4 Update package.json build scripts for Windows installer creation
- [x] 1.5 Verify electron-builder.json configuration for Windows NSIS target

## 2. Backend Bundling

- [x] 2.1 Choose backend bundling strategy (pkg vs nexe)
- [x] 2.2 Configure bundler to create standalone backend executable
- [x] 2.3 Create build script to bundle backend with dependencies
- [ ] 2.4 Test bundled executable runs without Node.js
- [ ] 2.5 Ensure environment variables are properly passed to bundled backend
- [ ] 2.6 Verify bundled backend can access required assets and configuration files

## 3. Frontend Build Optimization

- [x] 3.1 Configure Vite for production build with optimizations
- [x] 3.2 Ensure frontend assets are minified and tree-shaken
- [x] 3.3 Test frontend loads from bundled static assets
- [x] 3.4 Verify frontend communicates with local backend URL

## 4. Electron Main Process Development

- [x] 4.1 Create Electron main.ts with application lifecycle handling
- [x] 4.2 Implement backend process spawning (child_process.spawn)
- [x] 4.3 Add dynamic port allocation for backend
- [x] 4.4 Implement backend process cleanup on application exit
- [x] 4.5 Add error handling for backend startup failures
- [ ] 4.6 Test main process with various startup scenarios (backend slow, backend fail, etc.)

## 5. Backend Health Checking

- [x] 5.1 Ensure backend exposes a /health endpoint (or similar)
- [x] 5.2 Implement polling mechanism to check backend readiness
- [x] 5.3 Add retry logic with exponential backoff (e.g., 500ms intervals)
- [x] 5.4 Set health check timeout (e.g., 10-second timeout)
- [x] 5.5 Add logging for health check attempts and outcomes
- [ ] 5.6 Test health check with backend at various startup stages

## 6. Browser Integration

- [x] 6.1 Implement automatic browser launch after health check passes
- [x] 6.2 Detect default browser using system APIs or library
- [x] 6.3 Pass correct localhost URL and port to browser
- [x] 6.4 Handle browser launch failures gracefully
- [x] 6.5 Show user-friendly error message if browser cannot be opened
- [ ] 6.6 Test browser launch with different default browsers

## 7. Build Process Integration

- [x] 7.1 Create master build script that orchestrates:
  - Backend bundling
  - Frontend asset building
  - Electron app packaging
  - Windows installer generation
- [x] 7.2 Ensure build process handles errors and provides clear feedback
- [ ] 7.3 Verify installer artifact is produced in dist/ directory
- [ ] 7.4 Test build process on clean Windows environment

## 8. Installer Configuration

- [x] 8.1 Configure electron-builder with NSIS for Windows installer
- [x] 8.2 Set installer icon and branding
- [x] 8.3 Configure installation directory (Program Files)
- [x] 8.4 Ensure Start Menu folder and shortcuts are created
- [x] 8.5 Configure desktop shortcut creation (optional checkbox in installer)
- [x] 8.6 Set uninstall behavior to clean up all files
- [ ] 8.7 Test NSIS configuration for installer wizard

## 9. Application Icons & Branding

- [x] 9.1 Create application icon (256x256 minimum)
- [x] 9.2 Configure icon in electron-builder.json
- [x] 9.3 Ensure desktop shortcut uses application icon
- [x] 9.4 Ensure taskbar displays application icon correctly
- [x] 9.5 Test application icon appears in Start Menu

## 10. Manual Testing

- [ ] 10.1 Test on clean Windows VM: installer downloads and installs
- [ ] 10.2 Test application launches from desktop shortcut
- [ ] 10.3 Test application launches from Start Menu
- [ ] 10.4 Test backend starts automatically
- [ ] 10.5 Test browser opens after backend is ready
- [ ] 10.6 Test UI functionality with bundled backend
- [ ] 10.7 Test closing browser tab (backend should continue running)
- [ ] 10.8 Test closing application window (backend should stop)
- [ ] 10.9 Test uninstall removes all files and Start Menu entries
- [ ] 10.10 Test error scenarios (backend fails to start, port in use, browser unavailable)

## 11. Documentation

- [x] 11.1 Document build process and commands
- [x] 11.2 Document installation instructions for end users
- [x] 11.3 Document troubleshooting common issues
- [x] 11.4 Add comments to Electron main process code

## 12. Performance & Optimization

- [ ] 12.1 Measure installer size and optimize if necessary (target < 200MB)
- [ ] 12.2 Measure application startup time
- [ ] 12.3 Optimize backend bundling for size
- [ ] 12.4 Test memory usage of bundled application
- [ ] 12.5 Optimize health check polling (balance responsiveness vs. resource usage)
