import { utilityProcess, UtilityProcess } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

export class ServerManager {
  private serverProcess: UtilityProcess | null = null;
  private serverReady = false;
  private serverPort = 3001;

  async startServer(): Promise<void> {
    const serverPath = isDev
      ? path.join(__dirname, '../../dist/backend/index.js')
      : path.join(process.resourcesPath, 'backend/index.js');

    console.log(`Starting server from: ${serverPath}`);

    this.serverProcess = utilityProcess.fork(serverPath, [], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        ELECTRON_RUN_AS_NODE: '1',
        PORT: String(this.serverPort),
      },
    });

    this.serverProcess.on('message', (msg: any) => {
      if (msg && msg.type === 'READY') {
        this.serverReady = true;
        console.log(`✓ Server ready on http://localhost:${msg.port}`);
      }
    });

    this.serverProcess.on('exit', (code) => {
      console.log(`Server exited with code ${code}`);
      this.serverProcess = null;
      this.serverReady = false;
    });

    this.serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
    });

    // Give the server a moment to start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async stopServer(): Promise<void> {
    if (this.serverProcess) {
      try {
        this.serverProcess.kill();
        this.serverProcess = null;
        this.serverReady = false;
        console.log('Server stopped');
      } catch (error) {
        console.error('Error stopping server:', error);
      }
    }
  }

  isReady(): boolean {
    return this.serverReady;
  }

  getPort(): number {
    return this.serverPort;
  }
}

export const serverManager = new ServerManager();
