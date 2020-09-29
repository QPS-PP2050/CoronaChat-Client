const io = require('socket.io-client');
const { dialog } = require('electron');

const CHATEVENT = 
{
    CONNECT : 'connect',
    DISCONNECT : 'disconnect',
    MESSAGE : 'message'
}

let window;

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
            window = win;
        }
        this.socket.on(CHATEVENT.CONNECT, () => {
            //When server sends back login result
            this.socket.on('login-result', (login) =>{

            });
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                //Everytime a message comes through this function gets used to update the ui
                window.webContents.send('message', data);
            });
            //Updates UI when a member disconnects and reconnects
            this.socket.on('member_list', (list) => {

                window.webContents.send('members', list);
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
    send(data)
    {
        if(this.socket)
        {
            this.socket.emit(CHATEVENT.MESSAGE, {author: data.username, message: data.msg});
        }
    }

    //Sends login credentials to the server for checking
    sendLogin(credentials)
    {
        console.log(credentials);
        if(this.socket)
        {
            this.socket.send('login', credentials);
        }
    }
    
    connectServer(server_id)
    {
        if(this.socket)
        {
            this.socket.emit("join-server", server_id);
        }
    }

    //Changes channel
    changeChannel(server_id, channel_id)
    {
        if(this.socket)
        {
            this.socket.emit("change-chennel", {server: server_id, channel: channel_id});
        }
    }
}

exports.ClientSocket = ClientSocket;