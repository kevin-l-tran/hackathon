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
    overlayWindow?.setAlwaysOnTop(true, 'floating')
  })

  return overlayWindow
}

export function showOverlay() {
  if (!overlayWindow) return

  overlayWindow.setAlwaysOnTop(true, 'floating')
  overlayWindow.show()
  overlayWindow.focus()
  overlayWindow.webContents.send('overlay:opened')
}

export function hideOverlay() {
  if (!overlayWindow) return
  overlayWindow.hide()
  overlayWindow.webContents.send('overlay:hidden')
}

export function toggleOverlay() {
  if (!overlayWindow) return
  if (overlayWindow.isVisible()) overlayWindow.hide()
  else overlayWindow.show()
}

export function handleOverlayShortcut() {
  if (!overlayWindow) return

  if (!overlayWindow.isVisible()) {
    showOverlay()
    return
  }

  if (!overlayWindow.isFocused()) {
    showOverlay()
    return
  }

  // second press while focused = explicit dismiss
  hideOverlay()
}