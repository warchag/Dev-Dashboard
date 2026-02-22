import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      system: {
        getStats: () => Promise<any>,
        getProcesses: () => Promise<any>,
        getTopProcesses: () => Promise<any[]>
      },
      docker: {
        getContainers: () => Promise<any>,
        getLogs: (id: string) => Promise<string>
      },
      network: {
        getPorts: () => Promise<string>,
        getExtIp: () => Promise<string>,
        ping: (host: string) => Promise<{ success: boolean; output: string; metrics?: { min: number; avg: number; max: number; loss: number } }>
      },
      process: {
        kill: (pid: number | string) => Promise<boolean>
      }
    }
  }
}
