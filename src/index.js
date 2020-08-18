const { Menu, app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const {SocketConnect} = require('./lib/socket');
const url = require('url');
const path = require('path');


const isMac = process.platform === 'darwin';
var win = null;
//Creates Menu Template
const menuTemplate = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      { label: "Connect",
        click() {
          connectServer();
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  }
]

const clientSocket = new SocketConnect();


//Connect Function for connecting to Server, will be updated later
function connectServer() {
  clientSocket.connect(win);
}


function createWindow() 
{
   win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Corona Chat",
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadURL(`file://${__dirname}/html/index.html`);
  //win.webContents.openDevTools();
  ipc = win.ipcRenderer;
}

const menu = Menu.buildFromTemplate(menuTemplate)

Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('send-message', (event, data) => {
  clientSocket.send(data);
});