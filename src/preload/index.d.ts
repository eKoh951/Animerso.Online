import { ElectronAPI } from '@electron-toolkit/preload';

interface Api {
  addTorrent: (torrentId: string) => void;
  onTorrentProgress: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  onTorrentDone: (callback: (event: Electron.IpcRendererEvent) => void) => void;
  onTorrentFile: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  onTorrentError: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  removeTorrentProgress: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  removeTorrentDone: (callback: (event: Electron.IpcRendererEvent) => void) => void;
  removeTorrentFile: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
  removeTorrentError: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
  }
}
