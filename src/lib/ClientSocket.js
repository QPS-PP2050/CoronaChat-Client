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
    URL = "localhost";//"coronachat.xyz";
    socket;
    serverSocket;
    win;
    
    constructor(){}
    
    //Deals with connecting to the server
    connect(server)
    {
        this.manager = io.Manager('https://8080-a9e2d50d-4767-49de-8565-844601fd4cdc.ws-us02.gitpod.io/', {reconnect: true});
        this.socket = this.manager.socket('/');
        this.serverSocket = this.manager.socket('/');
        
        console.log(this.socket);

        this.socket.on(CHATEVENT.CONNECT, () => {})
    }

    //Disconects from Server
    disconnect()
    {   
        this.soc.emit(CHATEVENT.disconnect);
        this.soc.close();
    }

    //Sends message to the server
    send(data)
    {  
        if(this.serverSocket)
        {
            this.serverSocket.emit(CHATEVENT.MESSAGE, {author: data.username, message: data.msg});
        }
    }
    
    //Changes the server
    connectServer(server)
    {
        this.serverSocket = this.manager.socket(server);
        this.serverSocket.on(CHATEVENT.CONNECT, () => {
             
            this.serverSocket.on('message', (data) => {
                console.log(data);
                //Everytime a message comes through this function gets used to update the ui
                $("#messages").append(`<li><span class="message-content">${data.author}<br>${data.message}</span></li>`);
                $('#chat-window').scrollTop($('#chat-window').prop("scrollHeight"));
            });
            //Updates UI when a member disconnects and reconnects
            this.serverSocket.on('member_list', (list) => {
                $('#mem_list').empty();
                for(var i = 0; i < list.length; i++)
                {
                    $('#mem_list').append(`<li><a>${list[i]}</a></li>`);
                }
            });
        });
    }

    //Changes channel
    changeChannel(server_id, channel_id)
    {
        if(this.soc)
        {
            this.soc.emit("change-chennel", {server: server_id, channel: channel_id});
        }
    }

    joinVoice(channel_id, audio)
    {
        if(this.soc)
        {
            var clientVoice = new ClientVoice(server_id, channel_id, this.socket, audio)
        }
    }
}

exports.ClientSocket = ClientSocket;
