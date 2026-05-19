const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('espresso', {
  getOverlayState: () => ipcRenderer.invoke('overlay:get-state'),
  updateOverlay: (state) => ipcRenderer.send('overlay:update', state),
  toggleOverlay: (visible) => ipcRenderer.send('overlay:toggle', visible),
  setOverlayInteractive: (interactive) => ipcRenderer.send('overlay:set-interactive', interactive),
  onOverlayState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('overlay:state', handler);
    return () => ipcRenderer.removeListener('overlay:state', handler);
  }
});
