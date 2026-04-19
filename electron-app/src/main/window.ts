import { BrowserWindow } from 'electron'
import path from 'node:path'

let overlayWindow: BrowserWindow | null = null

export function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 520,
    height: 260,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  overlayWindow.loadFile(path.join(__dirname, '../renderer/index.html'), {
    hash: '/overlay'
  })

  overlayWindow.on('blur', () => {
    overlayWindow?.setAlwaysOnTop(false)
  })

  overlayWindow.on('focus', () => {
    overlayWindow?.setAlwaysOnTop(true)
  })

  return overlayWindow
}

export function getOverlayWindow() {
  return overlayWindow
}

export function showOverlay() {
  if (!overlayWindow) return
  overlayWindow.show()
  overlayWindow.focus()
  overlayWindow.webContents.send('overlay:opened')
}

export function hideOverlay() {
  overlayWindow?.hide()
}
