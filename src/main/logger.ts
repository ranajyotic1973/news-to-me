import fs from 'fs';
import path from 'path';
import os from 'os';
import { app } from 'electron';

export class AppLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    const appDataDir = app.getPath('userData');
    this.logDir = path.join(appDataDir, 'logs');
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);

    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
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
      fs.appendFileSync(this.logFile, logMessage + '\n');
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

  getLogFile(): string {
    return this.logFile;
  }

  getLogDir(): string {
    return this.logDir;
  }
}

export const logger = new AppLogger();
