import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      system: {
        getStats: () => Promise<any>,
        getProcesses: () => Promise<any>
      },
      docker: {
        getContainers: () => Promise<any>,
        getLogs: (id: string) => Promise<string>
      },
      network: {
        getPorts: () => Promise<string>,
        getExtIp: () => Promise<string>
      },
      process: {
        kill: (pid: number | string) => Promise<boolean>
      }
    }
  }
}
