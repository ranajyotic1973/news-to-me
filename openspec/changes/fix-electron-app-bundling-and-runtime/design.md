## Context

The application currently uses Electron to package a frontend (React/Vite) and backend (Express.js/Node.js). The backend is bundled using `pkg` into a standalone executable to avoid requiring a system-wide Node.js installation. However, when users run the installer and then the app, they encounter JavaScript runtime errors.

Current architecture:
- Electron main process spawns the bundled backend executable as a child process
- Frontend connects to backend via HTTP on localhost:3001
- Backend is bundled with `pkg` targeting node18-{platform}-{arch}
- All dependencies should be included in the `pkg` bundle

The issue: The `pkg` bundled backend fails at runtime with JavaScript errors, likely due to:
- Missing runtime files or assets bundled with the app
- Incorrect module resolution paths in the bundled backend
- Node.js built-in modules not properly included
- Path resolution issues for dependencies

## Goals / Non-Goals

**Goals:**
- Ensure the bundled backend executable runs without requiring external Node.js
- Provide clear error messages when backend startup fails
- Bundle all required assets, modules, and configuration with the Electron app
- Make the application work completely offline after installation
- Support all three platforms (Windows, macOS, Linux) consistently

**Non-Goals:**
- Switch to Tauri (already using Electron successfully, no architectural change needed)
- Add auto-update functionality (out of scope)
- Implement crash reporting/telemetry (separate feature)
- Optimize bundle size beyond current compression (Brotli)

## Decisions

### Decision 1: Keep Electron, Improve Backend Bundling

**Choice:** Use Electron with improved `pkg` bundling approach instead of switching to Tauri

**Rationale:** 
- Electron is already fully integrated with working desktop shortcuts, installer configuration, and platform-specific builds
- Switching to Tauri would require complete rewrite of main process, asset handling, and installer configuration
- The issue is not with Electron but with how the backend is being bundled and executed

**Alternatives Considered:**
1. Switch to Tauri - would require rewriting entire desktop infrastructure
2. Bundle Node.js runtime directly - increases installer size significantly
3. Use Node child_process differently - doesn't solve bundling issues

**Selected:** Improve the current Electron + pkg approach

### Decision 2: Pre-bundle Backend with All Dependencies

**Choice:** Ensure `pkg` includes all dependencies by explicitly listing assets and snapshots

**Rationale:**
- `pkg` has known issues with optional dependencies and nested modules
- Electron-builder already copies the entire dist-backend directory
- Need explicit asset configuration to ensure nothing is missed

**Implementation:**
- Add `"pkg": { "assets": [...], "scripts": [...] }` to package.json
- Include all critical runtime files in the bundled backend
- Use `pkg --compress Brotli` with increased snapshot (currently working)

### Decision 3: Add Error Handling and Diagnostics

**Choice:** Enhanced error reporting in main process for backend startup failures

**Rationale:**
- Users need clear feedback when backend fails
- Help debug issues without needing logs from terminal
- Distinguish between startup failure and configuration issues

**Implementation:**
- Capture stderr from backend process
- Display error dialog with actionable messages
- Log startup sequence to user's application data directory
- Add health check validation before launching UI

### Decision 4: Validate Backend Before Browser Launch

**Choice:** Implement pre-launch health checks with retry logic and timeout

**Rationale:**
- Prevents blank white screen when backend is unavailable
- Gives backend time to initialize
- Fails gracefully with user-friendly error

**Current Implementation:** Already has health checks in place, may need tuning

### Decision 5: Package Backend Separately from Frontend

**Choice:** Keep backend and frontend as separate build artifacts

**Rationale:**
- Allows independent testing and debugging
- Keeps installer size reasonable
- Matches current architecture

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `pkg` still fails to bundle all modules | Add comprehensive asset/script configuration; test with verbose output; add fallback error handling |
| Installer size increases from bundling more | Use Brotli compression; test size impact; document expected size per platform |
| Platform-specific backend binaries needed | Build matrix already handles this in CI/CD |
| Users unfamiliar with error messages | Use clear language in dialogs; provide troubleshooting guide in TROUBLESHOOTING.md |
| Backend takes time to initialize | Health check already implemented; may need to increase timeout or add splash screen |

## Migration Plan

1. **Update package.json** - Add explicit pkg configuration for assets and snapshots
2. **Enhance error handling in Electron main** - Capture and display backend errors
3. **Test bundled backend** - Verify it runs on clean system without Node.js
4. **Update build workflow** - Ensure all files are included in dist-backend
5. **Update documentation** - Add troubleshooting guide for runtime errors
6. **Release as patch** - v1.0.1 with bundling fixes

## Open Questions

1. What specific JavaScript errors are users seeing? Need to capture and log them
2. Are there optional dependencies in package.json that aren't being bundled?
3. Does the backend need any environment files or configuration?
4. What is the exact path resolution issue, if any, in the bundled backend?
