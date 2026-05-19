const { app, BrowserWindow, Menu, ipcMain, screen, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
let mainWindow;
let overlayWindow;
let overlayState = {
  visible: true,
  companion: 'bunny',
  theme: 'cherry',
  name: 'Vaishnavi',
  friends: []
};

function appUrl(route = '') {
  if (isDev) return `http://127.0.0.1:3000${route}`;
  return `file://${path.join(__dirname, '../dist/index.html')}${route}`;
}

function createOverlayWindow() {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  overlayWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.loadURL(appUrl('#/overlay'));
  overlayWindow.once('ready-to-show', () => overlayWindow.showInactive());
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    title: 'A Shot of Espresso',
    backgroundColor: '#f7ebe5',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadURL(appUrl());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();
  createOverlayWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
    createOverlayWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('overlay:get-state', () => overlayState);
ipcMain.on('overlay:update', (_event, nextState) => {
  overlayState = { ...overlayState, ...nextState };
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('overlay:state', overlayState);
    if (overlayState.visible) overlayWindow.showInactive();
    else overlayWindow.hide();
  }
});
ipcMain.on('overlay:toggle', (_event, visible) => {
  overlayState.visible = visible;
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  if (visible) overlayWindow.showInactive();
  else overlayWindow.hide();
});
ipcMain.on('overlay:set-interactive', (_event, interactive) => {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayWindow.setIgnoreMouseEvents(!interactive, { forward: true });
});
