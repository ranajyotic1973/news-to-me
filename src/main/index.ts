import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import open from 'open';
import { serverManager } from './server';
import { setupIPC } from './ipc';

let mainWindow: BrowserWindow | null = null;

// Launches the default system browser to display the backend-served UI.
// This is called in production mode after the backend server is ready.
const launchBrowserUI = async (): Promise<void> => {
  try {
    const url = serverManager.getUrl();
    console.log(`Launching browser with URL: ${url}`);
    await open(url);
  } catch (error) {
    console.error('Failed to open browser:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    dialog.showErrorBox(
      'Browser Launch Error',
      `Could not open the News To Me application in your browser.\n\n` +
        `Try opening this URL manually in your browser:\n${serverManager.getUrl()}\n\n` +
        `Error: ${message}`
    );
  }
};

const createWindow = async (): Promise<void> => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../dist/index.html')}`;

  await mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createMenu = (): void => {
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: (): void => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Reload (Hard)', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { type: 'separator' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+Minus', role: 'zoomOut' },
        { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About News To Me',
          click: (): void => {
            if (mainWindow) {
              mainWindow.webContents.send('show:about');
            }
          },
        },
      ],
    },
  ];

  if (isDev) {
    template.push({
      label: 'Debug',
      submenu: [
        { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.on('ready', async () => {
  createMenu();

  try {
    await serverManager.startServer();
    setupIPC();

    // Launch browser to the backend UI
    if (!isDev) {
      await launchBrowserUI();
    } else {
      // In development, create window to show dev tools
      await createWindow();
    }
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start News To Me application:\n\n${
        error instanceof Error ? error.message : String(error)
      }`
    );
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    await createWindow();
  }
});

app.on('before-quit', async () => {
  await serverManager.stopServer();
});

// Handle app closing via Electron menu
app.on('quit', async () => {
  await serverManager.stopServer();
});
