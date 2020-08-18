const ipcRenderer = require('electron').ipcRenderer; 


var el = document.getElementById('sendmsg');
if(el){
  el.addEventListener('click', function(){
    var text = document.getElementById('message').value;
    ipcRenderer.send('send-message', text);
    document.getElementById('message').value = "";
    ipcRenderer.once('actionreply', (event, data) => {
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(`${data.name} - ${data.text}`));
      document.getElementById('messages').append(li);
    });
  });
}