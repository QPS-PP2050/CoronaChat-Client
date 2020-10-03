const io = require('socket.io-client');
const { dialog } = require('electron');
const {ClientVoice} = require('./ClientVoice');
const { timers } = require('jquery');
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
    channel = "";
    constructor(){}
    
    //Deals with connecting to the server
    connect(server)
    {
        this.manager = io.Manager('http://localhost:8080', {reconnect: true});
        this.socket = this.manager.socket('/');
        this.serverSocket = this.manager.socket('/');

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
            this.serverSocket.emit(CHATEVENT.MESSAGE, {channel: this.channel, author: data.username, message: data.msg});
        }
    }
    
    //Changes the server
    connectServer(server)
    {
        this.channel = 'general';
        this.clearMessages();
        this.serverSocket.close();
        this.serverSocket = this.manager.socket(server);
        this.serverSocket.on(CHATEVENT.CONNECT, () => {
            
            this.serverSocket.on('message', (data) => {
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

    clearMessages()
    {
        $("#messages").empty();
        $('#chat-title').empty();
        $('#chat-title').append(`<p>${this.channel}</p>`);
    }

    //Changes channel
    changeChannel(channel_id)
    {
        if(this.serverSocket)
        {
            this.channel = channel_id;
            this.clearMessages();
            this.serverSocket.emit("change-channel", channel_id);
        }
    }

    joinVoice(channel_id, audio)
    {
        if(this.serverSocket)
        {
            var clientVoice = new ClientVoice(server_id, channel_id, this.socket, audio)
        }
    }
}

exports.ClientSocket = ClientSocket;
