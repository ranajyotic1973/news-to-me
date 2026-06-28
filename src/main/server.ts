import { utilityProcess, UtilityProcess } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import http from 'http';
import { logger } from './logger';

export interface ServerError {
  type: 'port-conflict' | 'crashed' | 'timeout' | 'unknown';
  message: string;
  stderr?: string;
}

// Manages the backend server lifecycle within the Electron app.
// Handles spawning, health checking, and cleanup of the Node.js backend process.
export class ServerManager {
  private serverProcess: UtilityProcess | null = null;
  private serverReady = false;
  private serverPort = 3001;
  private readyCallback: (() => void) | null = null;
  private lastError: ServerError | null = null;
  private stderrOutput: string[] = [];

  // Starts the backend server as a child process and waits for it to be ready.
  // In development, runs from dist/backend/index.js; in production, from bundled executable.
  async startServer(): Promise<void> {
    let serverPath: string;

    if (isDev) {
      // In development, server is in dist/backend/
      serverPath = path.join(process.cwd(), 'dist/backend/index.js');
    } else {
      // In production, server is in app resources
      serverPath = path.join(process.resourcesPath || process.cwd(), 'dist/backend/index.js');
    }

    logger.info(`Starting server from: ${serverPath}`);

    this.serverProcess = utilityProcess.fork(serverPath, [], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: isDev ? 'development' : 'production',
        ELECTRON_RUN_AS_NODE: '1',
        PORT: String(this.serverPort),
      },
    });

    if (this.serverProcess.stderr) {
      this.serverProcess.stderr.on('data', (data) => {
        const message = data.toString();
        this.stderrOutput.push(message);
        logger.error('Server stderr:', message);
      });
    }

    this.serverProcess.on('message', (msg: any) => {
      if (msg && msg.type === 'READY') {
        this.serverReady = true;
        logger.info(`✓ Server ready on http://localhost:${msg.port}`);
        if (this.readyCallback) {
          this.readyCallback();
          this.readyCallback = null;
        }
      }
    });

    this.serverProcess.on('exit', (code) => {
      logger.warn(`Server exited with code ${code}`);
      this.serverProcess = null;
      this.serverReady = false;
    });

    this.serverProcess.on('error', (error) => {
      logger.error('Server process error:', error);
      this.lastError = {
        type: 'crashed',
        message: 'Backend process crashed',
        stderr: this.stderrOutput.join('\n'),
      };
    });

    // Wait for server to be ready (with timeout)
    await this.waitForReady(10000);
  }

  // Polls the backend health endpoint until it responds, with timeout and retry logic.
  // Retries every 500ms until either the server is ready or the timeout is reached.
  private async waitForReady(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let retryCount = 0;

      const checkReady = () => {
        retryCount++;
        logger.info(`Health check attempt ${retryCount}`, { elapsed: Date.now() - startTime });

        const req = http.get(
          `http://localhost:${this.serverPort}/health`,
          { timeout: 2000 },
          (res) => {
            if (res.statusCode === 200) {
              this.serverReady = true;
              logger.info(`✓ Server health check passed after ${retryCount} attempts`);
              resolve();
              return;
            }
            scheduleRetry();
          }
        );

        req.on('error', (error) => {
          const err = error as any;
          if (err.code === 'EADDRINUSE') {
            logger.error('Port conflict detected', error);
            this.lastError = {
              type: 'port-conflict',
              message: `Port ${this.serverPort} is already in use. Close other News To Me instances.`,
            };
            reject(this.lastError);
          } else {
            scheduleRetry();
          }
        });

        req.on('timeout', () => {
          req.destroy();
          scheduleRetry();
        });
      };

      const scheduleRetry = () => {
        const elapsedMs = Date.now() - startTime;
        if (elapsedMs > timeout) {
          logger.error(`✗ Server health check failed: timeout after ${elapsedMs}ms`);
          this.lastError = {
            type: 'timeout',
            message: 'Server startup timeout. Backend may be crashed or misconfigured.',
            stderr: this.stderrOutput.join('\n'),
          };
          reject(this.lastError);
          return;
        }

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
        logger.info('Server stopped');
      } catch (error) {
        logger.error('Error stopping server:', error);
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

  getLastError(): ServerError | null {
    return this.lastError;
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
