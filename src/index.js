const { Menu, app, BrowserWindow, dialog, ipcMain, ipcRenderer } = require('electron');
const url = require('url');
const path = require('path');
const { inspect } = require('util');
const { checkServerIdentity } = require('tls');
const fetch = require('electron-fetch').default;
const settings = require('electron-settings');
const Store = require('electron-store');

const store = new Store();

let session = null;
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
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  {
    label: 'Options',
    submenu: [
      {
        label: "Inspect",
        click(){
          devTools();
        }
      }
    ]
  }
];

//This is a temp function to bring up dev tools for debugging, final version will have this removed
function devTools(){
  win.webContents.openDevTools();
}

//Creates window
function createWindow() 
{
   win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 800,
    title: "Corona Chat",
    webPreferences: {
      nodeIntegration: true
    }
  });
  if(store.get('login') == true)
  {
    session = store.get('token');
    win.loadURL(`file://${__dirname}/html/index.html`);
  }
  else
    win.loadURL(`file://${__dirname}/html/index.html`);
}

const menu = Menu.buildFromTemplate(menuTemplate)

Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('new-channel', (event, data) =>{
  
  fetch('https://8080-c8f61820-eb99-43d3-917e-7aa7ee178db5.ws-us02.gitpod.io/api/channels', { 
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => console.log(json))
});

ipcMain.on('logout', (event) =>{
  if(store.get('login') == true)
  {
    store.delete('login');
    store.delete('token');
  }
  win.loadURL(`file://${__dirname}/html/login.html`);
})

ipcMain.on('get-session', (event) => {
  event.sender.send('session', session);
  
});

ipcMain.on('login-window', (event)=>{
  win.loadURL(`file://${__dirname}/html/login.html`);
  win.title = "Login";
})

ipcMain.on('register-window', (event)=>{
  win.loadURL(`file://${__dirname}/html/register.html`);
  win.title = "Register";
})

ipcMain.on('register', (event, data) => {
  fetch('https://8080-c8f61820-eb99-43d3-917e-7aa7ee178db5.ws-us02.gitpod.io/api/users/register', { 
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => console.log(json))
});

ipcMain.on('login', (event, data) => {
  cred = {
    email : data.email,
    password : data.password
  }
  fetch('https://8080-c8f61820-eb99-43d3-917e-7aa7ee178db5.ws-us02.gitpod.io/api/users/login', { 
    method: 'POST',
    body:    JSON.stringify(cred),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    res.status;
    if(res.status == 200)
    {
      res.json().then(json =>{
        session = json.session;
        if(data.login)
        {
          store.set('login', true);
          store.set('token', session);
        }
        win.loadURL(`file://${__dirname}/html/index.html`);
      });
    }
    else
    {
      dialog.showErrorBox("Login Fail", "Email/Password is incorrect");
      return;
    }
  });
});

