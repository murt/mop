import {app, ipcMain, BrowserWindow} from 'electron';

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

  if (true) {
    //require('devtron').install();
    // TODO: Get details of windows in the specs and check if ANY of them have coverage
    // otherwise the dev tools window will be counted
    //win.webContents.openDevTools();
  }

  win.on('closed', () => {
    /* istanbul ignore next */
    win = null;
  });
}

//
app.on('ready', createWindow);

/* istanbul ignore next */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/* istanbul ignore next */
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
