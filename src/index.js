const { Menu, app, BrowserWindow, dialog, ipcMain, ipcRenderer, LocalStorage, Renderer } = require('electron');
const url = require('url');
const path = require('path');
const { inspect } = require('util');
const { checkServerIdentity } = require('tls');
const fetch = require('electron-fetch').default;
const settings = require('electron-settings');
const Store = require('electron-store');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
const store = new Store();

let session = null;
const baseURL = 'https://192.168.20.200:8080';


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

function messageBox(title, message, type)
{
  dialog.showMessageBox({
    type: type,
    buttons: ["Ok"],
    title: title,
    message: message
  });
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

ipcMain.on('add-friend', (event, username) => {
  
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
        event.sender.send("update-username");
        messageBox("Username", json.reason, "info");
      }
      else
        messageBox("Username", json.reason, "warning");
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
        messageBox("Password", json.reason, "info");
      else
        messageBox("Password", json.reason, "warning");
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
        messageBox("Delete Account", "Success on deletion of account", "info");
        event.reply('delete-account', {result:true})
      }
      else
      {
        messageBox("Delete Account", json.reason, "warning");
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
      messageBox("New Channel", "New channel was created", "info");
    else
      messageBox("New Channel", json.reason, "warning");
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

//This deals with sending the user details to the server via post
ipcMain.on('register', (event, data) => {
  fetch(`${baseURL}/api/users`, {
    method: 'POST',
    body:    JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
  .then(res => {
    res.status;
    if(res.status == 202)
    {
      //if user is registered it will return the user to the login
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



//When client sends register, this sends a post request to the server to see if user is valid
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
    if(res.status == 200)
    {
      //If the user is valid, the client then stores the session to the store for the main page to use
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