const ipcRenderer = require('electron').ipcRenderer; 


var el = document.getElementById('sendmsg');

ipcRenderer.on('actionreply', (event, data) => {
  var li = document.createElement('li');
  console.log(data)
  li.appendChild(document.createTextNode(`${data.text}`));  
  document.getElementById('messages').append(li);
});

if(el){
  el.addEventListener('click', function(){
    var text = document.getElementById('message').value;
    if(text === "")
    {
      return;
    }
    ipcRenderer.send('send-message', text);
    document.getElementById('message').value = "";
  });
}
