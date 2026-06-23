import { contextBridge, ipcRenderer } from 'electron';

interface ElectronAPI {
  invoke: (channel: string, args?: any) => Promise<any>;
  on: (channel: string, listener: (...args: any[]) => void) => void;
  off: (channel: string, listener: (...args: any[]) => void) => void;
  serverReady: () => Promise<boolean>;
  apiFetch: (method: string, path: string, body?: any) => Promise<any>;
  appQuit: () => Promise<void>;
  appVersion: () => Promise<string>;
}

const api: ElectronAPI = {
  invoke: (channel: string, args?: any) => ipcRenderer.invoke(channel, args),

  on: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => listener(...args));
  },

  off: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.off(channel, listener);
  },

  serverReady: () => ipcRenderer.invoke('server:ready'),

  apiFetch: (method: string, path: string, body?: any) =>
    ipcRenderer.invoke('api:fetch', { method, path, body }),

  appQuit: () => ipcRenderer.invoke('app:quit'),

  appVersion: () => ipcRenderer.invoke('app:version'),
};

contextBridge.exposeInMainWorld('electron', { api });

declare global {
  interface Window {
    electron: { api: ElectronAPI };
  }
}
