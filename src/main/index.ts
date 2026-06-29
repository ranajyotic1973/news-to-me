import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { setupIPC } from './ipc';
import { setupIpcHandlers } from './ipcHandlers';
import { logger } from './logger';

// Check if running in development mode (no external dependency)
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

const createWindow = async (): Promise<void> => {
  logger.info('Creating BrowserWindow');
  logger.debug('isDev', { isDev });

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

  logger.info('BrowserWindow created successfully');

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../dist/index.html')}`;

  logger.info('Loading URL', { startUrl, isDev });

  try {
    await mainWindow.loadURL(startUrl);
    logger.info('URL loaded successfully');
  } catch (error) {
    logger.error('Failed to load URL', error);
    throw error;
  }

  // Enable DevTools in both dev and production for debugging
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow?.webContents.toggleDevTools();
    }
  });

  // Auto-open DevTools in dev mode only
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    logger.info('Window closed');
    mainWindow = null;
  });

  logger.info('Window ready and displayed');
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
  logger.info('====================================');
  logger.info('Application starting...');
  logger.info('App Name: News To Me');
  logger.info('Version: ' + app.getVersion());
  logger.info('Electron Version: ' + process.versions.electron);
  logger.info('Node Version: ' + process.versions.node);
  logger.info('Platform: ' + process.platform);
  logger.info('App Path: ' + app.getAppPath());
  logger.info('User Data Path: ' + app.getPath('userData'));
  logger.info('isDev: ' + isDev);
  logger.info('isPackaged: ' + app.isPackaged);
  logger.info('====================================');

  createMenu();
  logger.info('Menu created');

  try {
    logger.info('Setting up IPC handlers...');
    setupIpcHandlers();
    logger.info('IPC handlers setup complete');

    logger.info('Setting up IPC...');
    setupIPC();
    logger.info('IPC setup complete');

    logger.info('Creating window...');
    await createWindow();
    logger.info('✓ Application started successfully');
  } catch (error) {
    logger.error('✗ Failed to start application', error);
    const errorMessage = 'Failed to start News To Me';
    const detailedMessage = (error instanceof Error ? error.message : String(error)) + '\n\nLogs: ' + logger.getLogDir();

    dialog.showErrorBox(errorMessage, detailedMessage);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  logger.info('App activated');
  if (mainWindow === null) {
    await createWindow();
  }
});

app.on('before-quit', () => {
  logger.info('Application closing...');
  logger.info('====================================');
  logger.cleanupLogs();
});
