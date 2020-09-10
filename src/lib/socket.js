const io = require('socket.io-client');
const { dialog } = require('electron');

const CHATEVENT = 
{
    CONNECT : 'connect',
    DISCONNECT : 'disconnect',
    MESSAGE : 'message'
}

class SocketConnect
{
    PORT = 8080;
    URL = "coronachat.xyz";
    socket;
    win;

    constructor(){}
    //Deals with connecting to the server
    connect(win)
    {
        this.socket = io.connect(`http://${this.URL}:${this.PORT}`);
        this.win = win;
        this.socket.on(CHATEVENT.CONNECT, (client) => {
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                //Everytime a message comes through this function gets used to update the ui
                this.win.webContents.send('actionreply', {text: data});
            });
            this.socket.on('member_list', (list) => {
                console.log(list);
                this.win.webContents.send('update_member', list);
                
            });
        });
        this.socket.on(CHATEVENT.DISCONNECT, function(){
            dialog.showErrorBox("Connection Fail", "Connection to server was dropped");
        });

    }

    //Disconects from Server
    disconnect()
    {   
        this.socket.emit(CHATEVENT.disconnect);
        this.socket.close();
    }

    //Sends message to the server
    send(msg)
    {
        if(this.socket)
        {
            this.socket.emit(CHATEVENT.MESSAGE, {author: this.socket.id, message: msg});
        }
    }

    //Changes channel
    changeChannel(channel)
    {
        if(this.socket)
        {
            this.socket.emit("channel-change", channel);
        }
    }
}

exports.SocketConnect = SocketConnect;
