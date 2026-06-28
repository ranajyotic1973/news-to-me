# Building News To Me Installer

This document describes how to build the News To Me application as a standalone Windows installer.

## Prerequisites

- Node.js 18+ (for building)
- Windows (for building Windows installer)
- npm or yarn

## Build Process

The complete build process is orchestrated by a single command:

```bash
npm run build
```

This command:
1. Compiles the frontend React app with Vite
2. Compiles and bundles the backend Node.js server into a standalone executable
3. Compiles the Electron main process
4. Packages everything into a Windows installer (.exe)

### Output

The final installer is produced at:
```
dist-final/News To Me Setup [version].exe
```

## Individual Build Steps

If you need to build individual components:

### Frontend Only
```bash
npm run build:frontend
```
Outputs: `dist/` (production-optimized React assets)

### Backend Only
```bash
npm run build:backend:js
npx pkg dist/backend/index.js --compress Brotli --targets node18-win-x64 --output dist-backend/backend.exe
```
Outputs: `dist-backend/backend.exe` (standalone backend executable)

## Backend Bundling with pkg

The backend is bundled into a standalone executable using the `pkg` tool so users don't need Node.js installed.

### pkg Configuration

Configuration is in `package.json`:

```json
{
  "pkg": {
    "assets": [
      "dist/backend/**/*",
      "node_modules/**/*"
    ],
    "scripts": [
      "dist/backend/**/*.js"
    ],
    "compress": "Brotli",
    "targets": [
      "node18-win-x64",
      "node18-macos-x64",
      "node18-macos-arm64",
      "node18-linux-x64"
    ]
  }
}
```

### What pkg Does

- **assets**: Includes all required files and node_modules in the executable
- **scripts**: Specifies which files contain executable code
- **compress**: Compresses the bundle using Brotli (reduces size by ~40%)
- **targets**: Creates binaries for each platform/architecture

### Platform-Specific Builds

The GitHub Actions workflow automatically creates platform-specific binaries:

- **Windows**: `node18-win-x64` → `backend.exe`
- **macOS x64**: `node18-macos-x64` → `backend`
- **macOS ARM64**: `node18-macos-arm64` → `backend` (Apple Silicon)
- **Linux**: `node18-linux-x64` → `backend`

Each platform gets its own optimized binary bundled in the installer.

### Electron App Only
```bash
npm run build:electron
```
Outputs: `dist-electron/` (compiled Electron main and preload scripts)

### Installer Only
```bash
npm run dist:win
```
Generates Windows installer from previously built artifacts

## Development

For development, run frontend and backend separately:

```bash
# Terminal 1: Start frontend dev server
npm run dev

# Terminal 2: Start backend dev server
npm run dev:backend
```

The backend will be available at `http://localhost:3001`
The frontend dev server will be at `http://localhost:5173`

## How It Works

### Architecture

1. **Backend**: Node.js Express server that serves APIs and provides the business logic
   - Bundled into a standalone executable using `pkg`
   - Can run without Node.js installed
   - Listens on localhost:3001
   - Exposes `/health` endpoint for startup detection

2. **Frontend**: React SPA that serves as the user interface
   - Built with Vite for optimal production bundle size
   - Served as static files by the backend Express server
   - Communicates with backend APIs

3. **Electron**: Desktop application wrapper that:
   - Spawns the backend server process
   - Waits for backend health check
   - Launches the default browser to the backend URL
   - Manages app lifecycle and cleanup

### Startup Flow

1. User double-clicks News To Me icon or opens from Start Menu
2. Electron main process starts
3. Backend server spawns as child process
4. Health check polls `/health` endpoint every 500ms (10s timeout)
5. Once backend is ready, default browser launches with backend URL
6. User sees the UI in their browser

### Shutdown Flow

1. User closes browser or Electron app
2. Electron detects window close or app quit
3. Backend process is killed
4. Child processes cleaned up

## Troubleshooting

### Build Fails

**Issue**: `pkg` command not found
- **Solution**: Run `npm install` to install dependencies

**Issue**: TypeScript compilation errors
- **Solution**: Run `npm run type-check` to identify issues

### Installer is Large

The installer size includes:
- Bundled Node.js runtime (included by `pkg`)
- Backend application code
- Frontend assets
- Electron binary

To optimize:
- Ensure dependencies are minimal
- Run `npm prune --production` before building
- Consider using minification/compression

### Backend Fails to Start

**Issue**: Backend starts but never sends ready signal
- **Solution**: Check that backend code sends `process.send({ type: 'READY', port })` message

**Issue**: Port already in use
- **Solution**: Close other applications using port 3001, or modify the port in `src/main/server.ts`

## Application Icons

The application icon is defined in `build/icon.png` (256x256 PNG).

To change the icon:
1. Replace `build/icon.png` with your custom icon
2. Rebuild the installer

## Distribution

After building, the installer `.exe` file can be:
- Distributed via email or file sharing
- Hosted on a website for download
- Included in release notes
- Deployed to update servers

Users simply run the installer to install News To Me.
