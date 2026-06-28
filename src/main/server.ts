import { utilityProcess, UtilityProcess } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import http from 'http';

// Manages the backend server lifecycle within the Electron app.
// Handles spawning, health checking, and cleanup of the Node.js backend process.
export class ServerManager {
  private serverProcess: UtilityProcess | null = null;
  private serverReady = false;
  private serverPort = 3001;
  private readyCallback: (() => void) | null = null;

  // Starts the backend server as a child process and waits for it to be ready.
  // In development, runs from dist/backend/index.js; in production, from bundled executable.
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
        if (this.readyCallback) {
          this.readyCallback();
          this.readyCallback = null;
        }
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

    // Wait for server to be ready (with timeout)
    await this.waitForReady(10000);
  }

  // Polls the backend health endpoint until it responds, with timeout and retry logic.
  // Retries every 500ms until either the server is ready or the timeout is reached.
  private async waitForReady(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkReady = () => {
        const req = http.get(
          `http://localhost:${this.serverPort}/health`,
          { timeout: 2000 },
          (res) => {
            if (res.statusCode === 200) {
              this.serverReady = true;
              console.log(`✓ Server health check passed`);
              resolve();
              return;
            }
            scheduleRetry();
          }
        );

        req.on('error', () => {
          scheduleRetry();
        });

        req.on('timeout', () => {
          req.destroy();
          scheduleRetry();
        });
      };

      const scheduleRetry = () => {
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs > timeout) {
          console.error(`✗ Server health check failed: timeout after ${elapsedMs}ms`);
          reject(new Error('Server startup timeout'));
          return;
        }

        // Retry after 500ms
        console.log(`  Health check retry... (${elapsedMs}ms elapsed)`);
        setTimeout(checkReady, 500);
      };

      checkReady();
    });
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

  getUrl(): string {
    return `http://localhost:${this.serverPort}`;
  }

  onReady(callback: () => void): void {
    if (this.serverReady) {
      callback();
    } else {
      this.readyCallback = callback;
    }
  }
}

export const serverManager = new ServerManager();
