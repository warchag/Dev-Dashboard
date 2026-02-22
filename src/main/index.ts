import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 710,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Set the macOS app dock icon explicitly
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon)
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const si = require('systeminformation')
  const { exec } = require('child_process')
  const util = require('util')
  const execPromise = util.promisify(exec)

  ipcMain.handle('system:getStats', async () => {
    try {
      const cpu = await si.currentLoad()
      const mem = await si.mem()
      const osInfo = await si.osInfo()
      const disk = await si.fsSize()
      const networkStats = await si.networkStats()
      const networkInterfaces = await si.networkInterfaces()
      const time = si.time()
      const cpuTemperature = await si.cpuTemperature()

      return { cpu, mem, osInfo, disk, networkStats, networkInterfaces, time, cpuTemperature }
    } catch (e) {
      console.error(e)
      return null
    }
  })

  ipcMain.handle('system:getTopProcesses', async () => {
    try {
      // Get all processes
      const procs = await si.processes()
      // Sort by CPU usage descending and take top 5
      const top5 = procs.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 5)
        .map((p) => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          mem: p.mem
        }))
      return top5
    } catch (e) {
      console.error(e)
      return []
    }
  })

  ipcMain.handle('docker:getContainers', async () => {
    try {
      return await si.dockerContainers('all')
    } catch (e) {
      console.error(e)
      return []
    }
  })

  ipcMain.handle('docker:getLogs', async (_, id: string) => {
    try {
      const { stdout, stderr } = await execPromise(`docker logs --tail 100 ${id}`)
      return stdout || stderr
    } catch (e: any) {
      return e.message || 'Error fetching logs'
    }
  })

  ipcMain.handle('network:getPorts', async () => {
    try {
      const { stdout } = await execPromise('lsof -i -P -n | grep LISTEN')
      return stdout
    } catch (e) {
      console.error(e)
      return ''
    }
  })

  ipcMain.handle('network:getExtIp', async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const json = await res.json()
      return json.ip
    } catch {
      return 'Unavailable'
    }
  })

  ipcMain.handle('network:ping', async (_, host: string) => {
    return new Promise((resolve) => {
      const isWin = process.platform === 'win32'
      const cmd = isWin ? 'ping' : 'ping'
      const args = isWin ? ['-n', '4', host] : ['-c', '4', host]

      const ping = require('child_process').spawn(cmd, args)
      let output = ''

      ping.stdout.on('data', (data) => {
        output += data.toString()
      })

      ping.stderr.on('data', (data) => {
        output += data.toString()
      })

      ping.on('close', (code) => {
        let metrics: any = undefined
        const success = code === 0

        // Simple regex parsing for avg latency and loss
        try {
          if (isWin) {
            const lossMatch = output.match(/\((\d+)% loss/i)
            const avgMatch = output.match(/Average = (\d+)ms/i)
            metrics = {
              loss: lossMatch ? parseInt(lossMatch[1]) : success ? 0 : 100,
              avg: avgMatch ? parseInt(avgMatch[1]) : 0,
              min: 0,
              max: 0
            }
          } else {
            const lossMatch = output.match(/(\d+(?:\.\d+)?)% packet loss/i)
            const statsMatch = output.match(
              /min\/avg\/max\/(?:mdev|stddev) = ([\d.]+)\/([\d.]+)\/([\d.]+)/i
            )
            metrics = {
              loss: lossMatch ? parseFloat(lossMatch[1]) : success ? 0 : 100,
              min: statsMatch ? parseFloat(statsMatch[1]) : 0,
              avg: statsMatch ? parseFloat(statsMatch[2]) : 0,
              max: statsMatch ? parseFloat(statsMatch[3]) : 0
            }
          }
        } catch (_e) {
          // Ignore parsing errors
        }

        resolve({ success, output, metrics })
      })
    })
  })

  ipcMain.handle('process:kill', async (_, pid: number | string) => {
    try {
      await execPromise(`kill -9 ${pid}`)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
