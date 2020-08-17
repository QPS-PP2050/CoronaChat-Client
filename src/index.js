const { app, BrowserWindow } = require('electron');
const { Menu } = require('electron');
const {SocketConnect} = require('./lib/socket');

const isMac = process.platform === 'darwin';

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
  clientSocket.connect("coronachat.xyz", 8080);
}


function createWindow() 
{

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Corona Chat",
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('html/index.html');
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
})
