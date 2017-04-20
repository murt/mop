import {app, BrowserWindow} from 'electron';

const path = require('path');
const url = require('url');

//
let win:Electron.BrowserWindow;

/**
 */
function createWindow ({width=800, height=600}:{width?:number, height?:number}={}) {
  win = new BrowserWindow({width, height});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

//
app.on('ready', createWindow);

//
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
