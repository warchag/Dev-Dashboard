import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  system: {
    getStats: () => ipcRenderer.invoke('system:getStats'),
    getProcesses: () => ipcRenderer.invoke('system:getProcesses')
  },
  docker: {
    getContainers: () => ipcRenderer.invoke('docker:getContainers'),
    getLogs: (id: string) => ipcRenderer.invoke('docker:getLogs', id)
  },
  network: {
    getPorts: () => ipcRenderer.invoke('network:getPorts'),
    getExtIp: () => ipcRenderer.invoke('network:getExtIp'),
    ping: (host: string) => ipcRenderer.invoke('network:ping', host)
  },
  process: {
    kill: (pid: number | string) => ipcRenderer.invoke('process:kill', pid)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
