const io = require('socket.io-client');
const { dialog } = require('electron');
$ = jQuery = require('jquery');


const CHATEVENT = 
{
    CONNECT : 'connect',
    DISCONNECT : 'disconnect',
    MESSAGE : 'message'
}

class ClientSocket
{
    PORT = 8080;
    URL = "coronachat.xyz";
    socket;
    win;

    constructor(){}
    //Deals with connecting to the server
    connect(win)
    {
        if(!this.socket)
        {
            this.socket = io.connect(`https://${this.URL}:${this.PORT}`, { secure: true });
            this.win = win;
        }
        this.socket.on(CHATEVENT.CONNECT, () => {
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                //Everytime a message comes through this function gets used to update the ui
                this.win.webContents.send('message', data);
            });
            this.socket.on('member_list', (list) => {

                this.win.webContents.send('members', list);
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
module.exports.ClientSocket = ClientSocket;