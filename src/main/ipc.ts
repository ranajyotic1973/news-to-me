import { ipcMain, app } from 'electron';
import { serverManager } from './server';

export function setupIPC(): void {
  // Server status check
  ipcMain.handle('server:ready', async () => {
    return serverManager.isReady();
  });

  // Get server port
  ipcMain.handle('server:port', async () => {
    return serverManager.getPort();
  });

  // API fetch proxy (renderer -> backend via main process)
  ipcMain.handle(
    'api:fetch',
    async (_event: any, { method, path: apiPath, body }: any) => {
      if (!serverManager.isReady()) {
        throw new Error('Server not ready');
      }

      try {
        const port = serverManager.getPort();
        const url = `http://localhost:${port}${apiPath}`;

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`HTTP ${response.status}: ${error}`);
        }

        return await response.json();
      } catch (error) {
        console.error('API fetch error:', error);
        throw error;
      }
    }
  );

  // App quit
  ipcMain.handle('app:quit', async () => {
    await serverManager.stopServer();
    app.quit();
  });

  // App version
  ipcMain.handle('app:version', async () => {
    return app.getVersion();
  });
}
