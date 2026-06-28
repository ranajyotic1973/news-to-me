## 1. Backend Bundling Configuration

- [x] 1.1 Add pkg configuration to package.json with explicit asset and script paths
- [x] 1.2 Configure pkg to use Brotli compression
- [ ] 1.3 Test bundled backend executable on clean system without Node.js installed
- [ ] 1.4 Verify all backend dependencies load correctly in bundled executable
- [ ] 1.5 Create separate platform-specific binaries (Windows, macOS arm64/x64, Linux x64)

## 2. Electron Main Process Error Handling

- [x] 2.1 Add error event listener to backend child process spawn
- [x] 2.2 Capture backend stderr/stdout and log to application log file
- [x] 2.3 Detect backend exit codes and determine failure type (crash, port conflict, etc.)
- [x] 2.4 Create error dialog component with message and troubleshooting suggestions
- [x] 2.5 Display appropriate error dialog based on failure type

## 3. Health Check Enhancement

- [x] 3.1 Increase health check retries from current to minimum 3 attempts
- [x] 3.2 Set health check timeout to 10 seconds
- [x] 3.3 Log each health check attempt to application log with timestamp
- [x] 3.4 Add retry delay between health check attempts (500ms)
- [x] 3.5 Verify browser launch only occurs after successful health check

## 4. Logging and Diagnostics

- [x] 4.1 Create application log file in %APPDATA%/News To Me/logs/ (Windows) or ~/.news-to-me/logs/ (Unix)
- [x] 4.2 Log application startup sequence with timestamps
- [x] 4.3 Log backend spawn and exit events
- [x] 4.4 Log health check attempts and results
- [x] 4.5 Add user-friendly error messages that distinguish configuration errors from system errors

## 5. Build Configuration Updates

- [x] 5.1 Update .github/workflows/build-app.yml to include all dist-backend binaries in build
- [x] 5.2 Verify Windows build includes backend.exe
- [x] 5.3 Verify macOS build includes both arm64 and x64 backend binaries
- [x] 5.4 Verify Linux build includes backend executable
- [x] 5.5 Update electron-builder.json to ensure all binaries are included in final packages

## 6. Installer Testing

- [ ] 6.1 Test Windows installer on system without Node.js
- [ ] 6.2 Test macOS installer on Intel Mac without Node.js
- [ ] 6.3 Test macOS installer on Apple Silicon Mac without Node.js
- [ ] 6.4 Test Linux .AppImage on clean Linux system without Node.js
- [ ] 6.5 Test Linux .deb installation without Node.js
- [ ] 6.6 Verify all installed applications start successfully and are fully functional

**Status**: Pending runtime testing on multiple systems. GitHub Actions will build installers on next release tag.

## 7. Documentation Updates

- [x] 7.1 Update TROUBLESHOOTING.md with backend startup error solutions
- [x] 7.2 Document common error messages and their fixes
- [x] 7.3 Explain where to find application logs for debugging
- [x] 7.4 Add section on "Requires Node.js? No!" to installation docs
- [x] 7.5 Update BUILDING.md with pkg configuration details

## 8. Release and Testing

- [ ] 8.1 Create v1.0.1 release with bundling fixes
- [ ] 8.2 Test complete user flow: install → configure → read news on all platforms
- [ ] 8.3 Verify offline functionality after initial configuration
- [ ] 8.4 Test error messages appear correctly when backend fails
- [ ] 8.5 Test log files are created and contain diagnostic information

**Status**: Pending end-to-end testing. Recommend testing after GitHub Actions successfully builds v1.0.1 installers.
