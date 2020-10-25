const { Menu, app, BrowserWindow, dialog, ipcMain, ipcRenderer, LocalStorage, Renderer } = require('electron');
const url = require('url');
const path = require('path');
const { inspect } = require('util');
const { checkServerIdentity } = require('tls');
const fetch = require('electron-fetch').default;
const settings = require('electron-settings');
const Store = require('electron-store');

const store = new Store();

let session = null;
const baseURL = 'https://8080-f528b2c8-77cb-4464-bb57-bbbb77706c2e.ws-us02.gitpod.io';


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
  if(store.get('login') === true)
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
  fetch(`${baseURL}/api/users/${store.get('token').id}`, { 
    method: 'PATCH',
    body:    JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.get('token').token}`
    }
  })
  .then(res => {
    res.json().then(json => {
      console.log(res.status);
      console.log(json)
      if(res.status == 201)
      {
        store.set('token', json.session);
        ipcRenderer.send("update-username");
        dialog.showMessageBox({
          type: "info",
          buttons: ["Ok"],
          title: "Username",
          message: json.reason
        });
      }
      else
      {
        dialog.showMessageBox({
          type: "warning",
          buttons: ["Ok"],
          title: "Username",
          message: json.reason
        });
      }
    })
  });
});

ipcMain.on('change-password', (event, data) =>{
  console.log(data)
  fetch(`${baseURL}/api/users/${store.get('token').id}`, { 
    method: 'PATCH',
    body:    JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.get('token').token}`
    }
  })
  .then((res) => {
    res.json().then(json => {
      if(res.status == 201)
      {
        dialog.showMessageBox({
          type: "info",
          buttons: ["Ok"],
          title: "Password",
          message: json.reason
        });
        
      }
      else
      {
        dialog.showMessageBox({
          type: "warning",
          buttons: ["Ok"],
          title: "Password",
          message: json.reason
        });
      }
    });
  })
});

ipcMain.on('invite-user', (event, data) => {
  fetch(`${baseURL}/api/servers/${data.server}/members`, {
    method: 'PUT',
    body: JSON.stringify({username: data.username}),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.get('token').token}`
    }
  })
})

ipcMain.on('delete-account', (event, data) => {
  fetch(`${baseURL}/api/users/${store.get('token').id}`, { 
    method: 'DELETE',
    body:    JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.get('token').token}`
    }
  })
  .then((res) => {
    res.json().then(json => {
      if(res.status == 200)
      {
        dialog.showMessageBoxSync({
          type: "info",
          buttons: ["Ok"],
          title: "Delete Account",
          message: "Success on deletion of account"
        });
        event.reply('delete-account', {result:true})
      }
      else
      {
        dialog.showMessageBoxSync({
          type: "warning",
          buttons: ["Ok"],
          title: "Delete Account",
          message: json.reason
        });
        event.reply('delete-account', {result:false})
      }
    });
  })
});

ipcMain.on('new-channel', (event, data) =>{
  fetch(`${baseURL}/api/servers/${data.server}/channels/`, { 
    method: 'POST',
    body:    JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${store.get('token').token}`
    }
  })
  .then(res => {
    if(res.status == 201)
    {
      dialog.showMessageBoxSync({
        type: "info",
        buttons: ["Ok"],
        title: "New Channel",
        message: "New channel was created"
      });
    }
    else
    {
      dialog.showMessageBoxSync({
        type: "warning",
        buttons: ["Ok"],
        title: "New Channel",
        message: json.reason
      });
    }
  });
});

ipcMain.on('logout', (event) =>{
  if(store.get('login') === true)
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
  fetch(`${baseURL}/api/users`, {
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => {
    res.status;
    if(res.status == 201)
    {
      win.loadURL(`file://${__dirname}/html/login.html`);
    }
    else
    {
      res.json().then(json =>{
        dialog.showErrorBox("Login Fail", `Reason: ${json.reason}`);
      });
    }
  });
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

