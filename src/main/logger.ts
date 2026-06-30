import fs from 'fs';
import path from 'path';
import os from 'os';
import { app } from 'electron';

export class AppLogger {
  private logDir: string | null = null;
  private logFile: string | null = null;

  constructor() {
    // Defer initialization until paths are actually needed
    // app.getPath() fails before app is ready
  }

  private getLogDir(): string {
    if (!this.logDir) {
      try {
        const appDataDir = app.getPath('userData');
        this.logDir = path.join(appDataDir, 'logs');
        this.ensureLogDirectory();
      } catch (error) {
        // Fallback if app isn't ready yet
        this.logDir = path.join(os.homedir(), '.news-to-me', 'logs');
        this.ensureLogDirectory();
      }
    }
    return this.logDir;
  }

  private getLogFile(): string {
    if (!this.logFile) {
      const logDir = this.getLogDir();
      this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }
    return this.logFile;
  }

  private ensureLogDirectory(): void {
    const logDir = this.getLogDir();
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private writeLog(level: string, message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }

    console.log(logMessage);

    try {
      const logFile = this.getLogFile();
      fs.appendFileSync(logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message: string, data?: any): void {
    this.writeLog('INFO', message, data);
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.writeLog('ERROR', message, errorData);
  }

  warn(message: string, data?: any): void {
    this.writeLog('WARN', message, data);
  }

  debug(message: string, data?: any): void {
    this.writeLog('DEBUG', message, data);
  }

  trace(message: string, data?: any): void {
    this.writeLog('TRACE', message, data);
  }

  getLogFilePath(): string {
    return this.getLogFile();
  }

  getLogDirectory(): string {
    return this.getLogDir();
  }

  cleanupLogs(): void {
    try {
      if (!this.logDir) return; // Not initialized yet

      if (fs.existsSync(this.logDir)) {
        const files = fs.readdirSync(this.logDir);
        let deletedCount = 0;

        for (const file of files) {
          const filePath = path.join(this.logDir, file);
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
          } catch (error) {
            // Silently ignore cleanup errors during shutdown
          }
        }

        // Don't log during cleanup - just silently clean up
        console.log(`[Logger] Cleaned up ${deletedCount} log files on shutdown`);
      }
    } catch (error) {
      // Silently ignore any errors during cleanup
      console.error('[Logger] Error during cleanup:', error);
    }
  }
}

export const logger = new AppLogger();
