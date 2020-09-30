const io = require('socket.io-client');
const { dialog } = require('electron');
const {ClientVoice} = require('./ClientVoice');
var $, jQuery;
$ = jQuery = require('jquery');


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
    connect()
    {
        if(!this.socket)
        {
            this.socket = io.connect(`https://${this.URL}:${this.PORT}`, { secure: true });
            console.log(this.socket);
        }
        
        this.socket.on(CHATEVENT.CONNECT, () => {
             
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                //Everytime a message comes through this function gets used to update the ui
                $("#messages").append(`<li><span class="message-content">${data.author}<br>${data.message}</span></li>`);
                $('#chat-window').scrollTop($('#chat-window').prop("scrollHeight"));
            });
            //Updates UI when a member disconnects and reconnects
            this.socket.on('member_list', (list) => {

                $('#mem_list').empty();
                for(var i = 0; i < list.length; i++)
                {
                    $('#mem_list').append(`<li><a>${list[i]}</a></li>`);
                }
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

    joinVoice(server_id, channel_id, audio)
    {
        if(this.socket)
        {
            var clientVoice = new ClientVoice(server_id, channel_id, this.socket, audio)
        }
    }
}

exports.ClientSocket = ClientSocket;