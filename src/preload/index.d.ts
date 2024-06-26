import { ElectronAPI } from '@electron-toolkit/preload';

interface TorrentProgressData {
  numPeers: number;
  downloaded: number;
  total: number;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  remaining: string;
}

interface TorrentFileStartData {
  mimeType: string;
  url: string;
}

interface Api {
  addTorrent: (torrentId: string) => void;
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  once: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  removeListener: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
  }
}
