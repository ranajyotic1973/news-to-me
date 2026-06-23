# News To Me - Desktop Application Setup

This document explains how to package the News To Me app as an installable desktop application for Windows, macOS, and Linux.

## Quick Start

### 1. Install Dependencies

First, install the new Electron and build dependencies:

```bash
npm install
```

This installs:
- `electron` - Desktop application framework
- `electron-builder` - Packaging and installer creation
- `vite-plugin-electron` - Electron integration with Vite
- `vite-plugin-electron-builder` - Build automation
- `electron-is-dev` - Development mode detection

### 2. Generate App Icon (Optional - For Production)

The app icon is provided as SVG at `build/icon.svg`. To convert it to the required formats:

**Option A: Using an Online Tool**
1. Go to: https://webutils.io/tool/electron-icon-generator
2. Upload `build/icon.svg`
3. Download the generated icon files (icon.ico, icon.icns, icon.png)
4. Place them in the `build/` directory

**Option B: Using ImageMagick (Command Line)**
```bash
# Windows .ico
magick convert build/icon.svg -define icon:auto-resize=256,128,96,64,48,32,16 build/icon.ico

# PNG for Linux/fallback
magick convert build/icon.svg -density 300 -resize 512x512 build/icon.png
```

**Option C: Use the Development Icon**
The app automatically uses `build/icon.svg` which works fine for development and testing.

### 3. Development Mode

Run the app in development mode (with hot reload):

```bash
npm run dev
```

This will:
- Start the Vite dev server on http://localhost:5173
- Compile Electron main process and preload script
- Open the Electron window loading the dev server
- Enable React Hot Module Replacement (HMR)
- Open Chrome DevTools

**Note:** The Express backend is NOT automatically started. You can start it separately if needed:
```bash
npm run dev:backend
```

### 4. Build for Production

#### Build Web Version (for web hosting)
```bash
npm run build:web
```
Output: `dist/` directory with static HTML/CSS/JS

#### Build Desktop App (all platforms)
```bash
npm run build:app
```
Output: `dist-final/` directory with installers for Windows, macOS, and Linux

#### Build for Specific Platform

**Windows:**
```bash
npm run dist:win
```
Creates:
- `dist-final/News To Me Setup 1.0.0.exe` - NSIS installer
- `dist-final/News To Me 1.0.0.exe` - Portable executable (no installation)

**macOS:**
```bash
npm run dist:mac
```
Creates:
- `dist-final/News To Me 1.0.0.dmg` - Disk image installer
- `dist-final/News To Me 1.0.0.zip` - ZIP archive

**Linux:**
```bash
npm run dist:linux
```
Creates:
- `dist-final/News To Me 1.0.0.AppImage` - Single portable executable
- `dist-final/news-to-me_1.0.0_amd64.deb` - Debian/Ubuntu package

### 5. Test the Package (Without Building Installer)

```bash
npm run pack
```

This creates a package without building the installer, useful for quick testing.

### 6. Installation Instructions for End Users

#### Windows
1. Download `News To Me Setup 1.0.0.exe` or `News To Me 1.0.0.exe`
2. Run the installer
3. Choose installation directory (if using NSIS)
4. Click "Install"
5. App shortcut appears on Desktop and Start Menu
6. Launch from shortcut or Start Menu

#### macOS
1. Download `News To Me 1.0.0.dmg`
2. Open the DMG file
3. Drag "News To Me" app to Applications folder
4. Eject the DMG
5. Open Applications folder and double-click "News To Me"
6. App may ask for permission on first launch (macOS Gatekeeper)

#### Linux (Ubuntu/Debian)
```bash
# Option 1: Install from .deb package
sudo dpkg -i news-to-me_1.0.0_amd64.deb
# Then launch from applications menu

# Option 2: Run AppImage directly
./News\ To\ Me\ 1.0.0.AppImage
```

## Project Structure

```
news-to-me/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # App lifecycle & window management
│   │   ├── server.ts      # Express server spawning
│   │   └── ipc.ts         # IPC communication handlers
│   ├── preload/           # Preload script (secure IPC bridge)
│   │   └── index.ts       # Expose controlled API
│   ├── backend/           # Express backend
│   │   └── index.ts       # Server entry point
│   └── frontend/          # React + Vite UI
│       ├── App.tsx
│       ├── main.tsx
│       └── ...
├── build/                 # Build resources
│   ├── icon.svg          # Source icon
│   ├── icon.png          # Generated (PNG for Linux)
│   ├── icon.ico          # Generated (ICO for Windows)
│   └── icon.icns         # Generated (ICNS for macOS)
├── dist/                  # Built frontend (created by build)
├── dist-electron/         # Compiled Electron files (created by build)
│   ├── main/              # Compiled main process
│   └── preload/           # Compiled preload script
├── dist-final/            # Final installers (created by build)
├── electron-builder.json  # Electron builder configuration
├── vite.config.ts         # Vite + Electron config
└── package.json           # Dependencies & scripts
```

## How It Works

### Architecture

1. **Main Process** (`src/main/index.ts`)
   - Manages Electron window lifecycle
   - Spawns Express server as a child process
   - Sets up IPC communication channels
   - Handles menu and app events

2. **Server** (`src/main/server.ts`)
   - Spawns Express backend as a utility process
   - Monitors process health
   - Gracefully shuts down on app close

3. **IPC Bridge** (`src/preload/index.ts`)
   - Provides secure API for renderer to communicate with main process
   - Context isolation prevents direct Node.js access
   - Exposes controlled methods: `apiFetch()`, `serverReady()`, `appQuit()`

4. **Frontend** (`src/frontend/`)
   - React + Vite app
   - Uses `window.electron.api` to communicate with backend
   - Works in both Electron and web modes

### IPC Communication Flow

```
React Component
    ↓
window.electron.api.apiFetch()  (preload exposed)
    ↓
ipcRenderer.invoke() → main process
    ↓
fetch() to http://localhost:3001
    ↓
Express Backend
    ↓
Response back through same path
```

### Backend Communication in Production

When running as a desktop app:
- Express runs as a background process (spawned by Electron)
- Frontend communicates via local `http://localhost:3001`
- IPC bridge (`preload` script) handles the fetch requests
- No external network calls needed (all local)

## Development Workflow

### Making Changes

1. **Backend Changes** (`src/backend/`)
   - Electron automatically restarts server process when it crashes
   - For manual restart, close and reopen the app

2. **Frontend Changes** (`src/frontend/`)
   - Vite HMR automatically reloads UI
   - No need to restart Electron window

3. **Main Process Changes** (`src/main/`)
   - Electron app automatically restarts
   - Check console for any startup errors

4. **Preload Script Changes** (`src/preload/`)
   - Electron app automatically restarts

### Debugging

**Browser DevTools (Frontend)**
- Press `F12` to open DevTools
- Inspect React components, check network calls
- Console shows frontend errors

**Chrome DevTools (Main Process)**
- Check console output for main process logs
- Set `chrome://inspect` to debug Node.js process

**Server Logs**
- Check console output for Express server logs
- All server startup/error messages visible

## Troubleshooting

### "App doesn't start"
1. Check console output for errors
2. Verify `npm install` completed successfully
3. Verify backend port 3001 is available (not blocked by firewall)
4. Run `npm run dev` to see detailed startup logs

### "Cannot find module 'electron'"
```bash
npm install electron --save-dev
```

### "Server not starting"
1. Check if port 3001 is already in use
2. Run backend separately: `npm run dev:backend`
3. Check for firewall blocking localhost:3001

### "App builds but won't install"
1. Verify icon files exist in `build/` directory
2. Check electron-builder.json for syntax errors
3. Run `npm run pack` first to test without building installer

### "Windows Defender warns about EXE"
- This is normal for unsigned apps
- Code sign the executable before distribution (requires certificate)
- For testing, tell Windows Defender it's safe

## Code Signing & Distribution

For production distribution (Microsoft Store, App Store, etc.):

### Windows
- Obtain a code signing certificate
- Configure in `electron-builder.json`:
  ```json
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
  ```

### macOS
- Register Apple Developer account
- Code sign and notarize for Gatekeeper
- Configure in `electron-builder.json`:
  ```json
  "mac": {
    "identity": "Developer ID Application: Your Name",
    "notarize": true
  }
  ```

### Linux
- No code signing required
- DEB and AppImage formats are standard

See [electron-builder documentation](https://www.electron.build/) for detailed signing instructions.

## Useful Commands

```bash
# Development
npm run dev              # Start in dev mode
npm run dev:backend    # Run backend separately (if needed)

# Building
npm run build:web      # Build web version only
npm run build:app      # Build desktop apps for all platforms
npm run preview        # Preview production build locally

# Platform-specific builds
npm run dist:win       # Build Windows installer
npm run dist:mac       # Build macOS DMG
npm run dist:linux     # Build Linux AppImage/DEB

# Testing & Quality
npm run type-check     # TypeScript validation
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix linting issues
npm run format         # Format code with Prettier

# Packaging
npm run pack           # Create package without installer (quick test)
npm run dist           # Build installers for all platforms
```

## FAQ

**Q: Can I distribute this commercially?**
A: Yes! The app uses MIT/ISC licensed dependencies. Check all dependencies for licensing compatibility. Electron itself is MIT licensed.

**Q: What platforms are supported?**
A: Windows (7+), macOS (10.13+), Linux (most modern distributions).

**Q: Do users need Node.js installed?**
A: No! The desktop app is completely self-contained. Electron bundles everything needed.

**Q: How do I update the app?**
A: electron-builder supports auto-updates. See [electron-updater documentation](https://www.electron.build/auto-update.html) for implementation.

**Q: Can I use the same code for web and desktop?**
A: Yes! The frontend code is platform-agnostic. Just build with `npm run build:web` for web.

**Q: How large is the final app?**
A: Typically 200-300 MB depending on dependencies. This is expected for Electron apps (includes Chromium).

## Additional Resources

- [Electron Official Documentation](https://www.electronjs.org/docs)
- [electron-builder Guide](https://www.electron.build/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

**Need Help?**
Check the console output for detailed error messages. Most issues are related to:
1. Missing dependencies (`npm install`)
2. Port conflicts (firewall/other apps on 3001/5173)
3. Icon files not found (check `build/` directory)
