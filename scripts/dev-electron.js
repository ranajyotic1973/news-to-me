// Launches Electron for development.
//
// Some host environments (e.g. certain editor-integrated terminals) export
// ELECTRON_RUN_AS_NODE=1, which forces the Electron binary to behave as plain
// Node.js — the Electron API (app, BrowserWindow, ...) is never injected and the
// main process crashes with "Cannot read properties of undefined (reading 'on')".
// Electron checks for the variable's *presence*, so it must be deleted (setting
// it empty is not enough). We delete it here before spawning Electron.
const { spawn } = require('child_process');

delete process.env.ELECTRON_RUN_AS_NODE;

// Path to the Electron executable (require('electron') returns the path string
// when loaded from Node.js).
const electronPath = require('electron');

// Give the Vite dev server (started concurrently) a moment to come up.
const STARTUP_DELAY_MS = 2000;

setTimeout(() => {
  const child = spawn(electronPath, ['.', '--remote-debugging-port=9223'], {
    stdio: 'inherit',
  });
  child.on('close', (code) => process.exit(code ?? 0));
}, STARTUP_DELAY_MS);
