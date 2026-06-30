import { ipcMain, app } from 'electron';

export function setupIPC(): void {
  // App quit
  ipcMain.handle('app:quit', async () => {
    app.quit();
  });

  // App version
  ipcMain.handle('app:version', async () => {
    return app.getVersion();
  });
}
