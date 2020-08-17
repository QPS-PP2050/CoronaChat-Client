const { app, BrowserWindow } = require('electron');
const {template} = require('./lib/menu');
const {Menu} = require('electron');


function createWindow () {
    
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

const menu = Menu.buildFromTemplate(template)

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
