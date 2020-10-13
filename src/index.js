const { Menu, app, BrowserWindow, dialog, ipcMain, ipcRenderer, LocalStorage } = require('electron');
const url = require('url');
const path = require('path');
const { inspect } = require('util');
const { checkServerIdentity } = require('tls');
const fetch = require('electron-fetch').default;
const settings = require('electron-settings');
const Store = require('electron-store');

const store = new Store();

let session = null;
const baseURL = 'https://8080-bacf873d-5771-49a9-a3e5-e599ef547c22.ws-us02.gitpod.io';


var win;
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
  var height = 600;
  var width = 800;
  if(store.has('width') && store.has('height'))
  {
    height = store.get('height');
    width = store.get('width');
  } 
   win = new BrowserWindow({
    width: width,
    height: height,
    minHeight: 600,
    minWidth: 800,
    title: "Corona Chat",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });
  if(store.get('login') == true)
  {
    win.loadURL(`file://${__dirname}/html/index.html`);
  }
  else
    win.loadURL(`file://${__dirname}/html/login.html`);
  win.on('close', () =>{
    store.set('width', win.getBounds().width);
    store.set('height', win.getBounds().height);
  })
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

ipcMain.on('change-username', (event, data) =>{
  fetch(`${baseURL}/api/users/username`, { 
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => console.log(json))
});

ipcMain.on('change-password', (event, data) =>{
  fetch(`${baseURL}/api/users/password`, { 
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => res.json())
  .then(json => console.log(json))
});

ipcMain.on('delete-account', (event, data) => {

});

ipcMain.on('new-channel', (event, data) =>{
  
  fetch(`${baseURL}/api/servers/${data.server_id}/channels/`, { 
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

ipcMain.on('login-window', (event)=>{
  win.loadURL(`file://${__dirname}/html/login.html`);
  win.title = "Login";
})

ipcMain.on('register-window', (event)=>{
  win.loadURL(`file://${__dirname}/html/register.html`);
  win.title = "Register";
})

ipcMain.on('register', (event, data) => {
  fetch(`${baseURL}/api/users/register`, { 
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
  fetch(`${baseURL}/api/users/login`, { 
    method: 'POST',
    body:    JSON.stringify(cred),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    res.status;
    if(res.status == 200)
    {
      res.json().then(json =>{
        store.set('login', data.login);
        store.set('token', json.session);
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

