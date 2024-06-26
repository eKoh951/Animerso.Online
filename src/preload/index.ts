import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {
  addTorrent: (torrentId: string) => {
    ipcRenderer.send('webtorrent-action', { action: 'add-torrent', torrentId });
  },
  on: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
    ipcRenderer.on(channel, callback);
  },
  once: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
    ipcRenderer.once(channel, callback);
  },
  removeListener: (channel: string, callback: (event: Electron.IpcRendererEvent, data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  }
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
