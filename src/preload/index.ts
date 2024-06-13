import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  addTorrent: (torrentId: string) => {
    console.log('addTorrent');
    ipcRenderer.send('webtorrent-action', { action: 'add-torrent', torrentId });
  },
  onTorrentProgress: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.on('torrent-progress', callback),
  onTorrentDone: (callback: (event: Electron.IpcRendererEvent) => void) => ipcRenderer.on('torrent-done', callback),
  onTorrentFile: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.on('torrent-file', callback),
  onTorrentError: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.on('torrent-error', callback),
  removeTorrentProgress: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.removeListener('torrent-progress', callback),
  removeTorrentDone: (callback: (event: Electron.IpcRendererEvent) => void) => ipcRenderer.removeListener('torrent-done', callback),
  removeTorrentFile: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.removeListener('torrent-file', callback),
  removeTorrentError: (callback: (event: Electron.IpcRendererEvent, data: any) => void) => ipcRenderer.removeListener('torrent-error', callback),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
  // @ts-expect-error (define in dts)
  window.api = api;
}
