## Context

The News To Me application is built with:
- **Frontend**: React + TypeScript + Vite (SPA)
- **Backend**: Node.js + TypeScript HTTP server
- **Desktop Framework**: Electron (already configured in electron-builder.json)
- **Current State**: Backend and frontend run separately; requires manual startup and browser navigation

The goal is to unify these into a single, installable desktop application that handles all startup orchestration automatically.

## Goals / Non-Goals

**Goals:**
- Create a Windows installer (.exe) that installs the complete application
- Automatically start the backend server when the application launches
- Automatically detect backend readiness and launch the UI in the default browser
- Create desktop shortcuts and start menu entries for easy access
- Provide a seamless, single-click user experience

**Non-Goals:**
- Multi-platform support (Mac/Linux) — focus on Windows only
- Auto-updates or update checking
- Custom OS-level configuration (registry settings, file associations)
- Uninstaller customization beyond electron-builder defaults

## Decisions

### 1. Electron as Desktop Host
**Decision**: Use Electron as the desktop application shell.

**Rationale**: Already configured via electron-builder.json; provides cross-platform foundation (though scoped to Windows for now); handles window management and system integration easily.

**Alternatives Considered**:
- Tauri: Lighter weight, but requires Rust and adds complexity to bundling the backend
- NSIS/Inno Setup: Traditional installers, but no GUI window management or auto-launch capabilities

### 2. Backend as Child Process
**Decision**: Start the backend as a child process spawned by the Electron main process.

**Rationale**: Keeps backend and frontend lifecycle tightly coupled; allows Electron to manage cleanup and error handling; no need for separate service installation.

**Alternatives Considered**:
- Separate Windows Service: More complex uninstall; harder to debug; overkill for single-user app
- Bundled DLL/executable: Same approach; less portable than Node.js child process

### 3. Health Check Before Browser Launch
**Decision**: Poll the backend health endpoint (e.g., GET /health or similar) before launching browser.

**Rationale**: Ensures backend is ready to handle requests; prevents browser errors from premature launch.

**Alternatives Considered**:
- Fixed delay (e.g., wait 2s): Fragile; may fail on slow machines
- Log file polling: Works but is less reliable than an actual HTTP check

### 4. Package Structure
**Decision**: Distribute backend executable as a bundled Node.js binary with assets.

**Rationale**: Simplifies distribution; avoids requiring Node.js installation on user machines; reduces installer size compared to shipping entire node_modules.

**Implementation**:
- Use `pkg` or `nexe` to bundle backend into standalone executable
- Place executable in Electron app resources folder
- Electron main process spawns it at startup

### 5. Browser Auto-Launch
**Decision**: Use the `open` npm package or native OS APIs to launch default browser with backend URL.

**Rationale**: Works cross-OS (even if scoped to Windows); reliable; handles default browser detection.

**Alternatives Considered**:
- Embed browser in Electron: Heavy; defeats purpose of using Electron if we're just hosting web UI
- Hard-code browser path: Fragile; breaks if user uninstalls/moves browser

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Backend fails to start | Electron main process catches error, logs it, and shows user-friendly error dialog; suggests restarting app |
| Health check timeout | Set reasonable timeout (5-10s); retry logic before giving up; fallback to browser launch after max retries |
| Port already in use | Backend should use OS-provided free port; pass port to browser via environment variable or config file |
| User closes Electron window but backend stays running | Electron main process kills backend child process on app quit |
| Installer size bloat | Monitored during development; consider splitting UI and backend assets if size becomes excessive |

## Migration Plan

**Deployment**:
1. Update build system to create bundled backend executable
2. Add Electron main process startup code
3. Build and test installer locally
4. Distribute .exe to users via download/auto-update mechanism

**Rollback**: Users can uninstall via Windows Add/Remove Programs; previous version available for re-download if needed

## Open Questions

- What is the expected backend HTTP API? What endpoint should be polled for health check?
- Should the backend use a fixed port or dynamic port allocation?
- What should happen if the user closes the browser tab but the Electron window is still open?
- Are there environment-specific configs (dev vs. production) needed in the bundled executable?
