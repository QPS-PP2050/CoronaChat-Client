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

    connect(win)
    {
        this.socket = io.connect(`http://${URL}:${PORT}`);
        this.win = win;
        this.socket.on(CHATEVENT.CONNECT, (client) => {
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                this.win.webContents.send('actionreply', {text: data});
            }); 
        });
        this.socket.on(CHATEVENT.DISCONNECT, function(){
            dialog.showErrorBox("Connection Fail", "Connection to server was dropped");
        });
    }

    disconnect()
    {   
        this.socket.emit(CHATEVENT.disconnect);
        this.socket.close();
    }

    send(msg)
    {
        if(this.socket)
        {
            this.socket.emit(CHATEVENT.MESSAGE, msg);
        }
    }
}

exports.SocketConnect = SocketConnect;
