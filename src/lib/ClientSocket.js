const io = require('socket.io-client');
const { dialog } = require('electron');
const {ClientVoice} = require('./ClientVoice');
const { timers } = require('jquery');
var $, jQuery;
$ = jQuery = require('jquery');

const events = require('./types/types');



let window;

class ClientSocket
{
    socketList = [];
    PORT = 8080;
    URL = "localhost";//"coronachat.xyz";
    socket;
    serverSocket;
    win;
    channel = "";
    ui = {}
    constructor(){}
    
    //Deals with connecting to the server
    connect(socksess)
    {
        this.manager = io.Manager('http://localhost:8080', {reconnect: true, query: {
            session : socksess
        }});
        
        this.serverSocket = this.manager.socket('/');
        this.serverSocket.on(events.EVENTS.CONNECT, () => {});
    }

    //Disconects from Server
    disconnect()
    {   
        this.soc.emit(events.EVENTS.DISCONNECT);
        this.soc.close();
    }

    //Sends message to the server
    send(data)
    {  
        if(this.serverSocket)
        {
            this.serverSocket.emit(events.EVENTS.MESSAGE, {channel: this.channel, author: data.username, message: data.msg});
        }
    }
    
    //Changes the server
    connectServer(server)
    {
        this.channel = 'general';
        this.clearMessages();
        this.serverSocket.disconnect();
        this.serverSocket = this.manager.socket(`/${server}`);
        this.serverSocket.connect();

        this.serverSocket.on(events.EVENTS.CONNECT, () => {
            
            this.serverSocket.on('message', (data) => {

                //Everytime a message comes through this function gets used to update the ui
                
                var author = $('<span></span>');
                var message = $('<span></span>');
                var parent = $('<li></li>');
                message.addClass('message-content');
                author.addClass('author-content');
                message.append(data.message);
                author.append(data.author);
                parent.append(author);
                parent.append(message);
                $(events.UI.MESSAGES).append(parent);
                $('#chat-window').scrollTop($('#chat-window').prop("scrollHeight"));
                console.log(this.serverSocket);
            });
            //Updates UI when a member disconnects and reconnects
            this.serverSocket.on(events.EVENTS.MEMBER_UPDATE, (list) => {
                $(events.UI.MEMBER_LIST).empty();
                for(var i = 0; i < list.length; i++)
                {
                    $(events.UI.MEMBER_LIST).append(`<li><a>${list[i]}</a></li>`);
                }
            });
            this.serverSocket.on('disconnect', () =>{
                this.serverSocket.removeAllListeners();
            });
        });
    }

    clearMessages()
    {
        $(events.UI.MESSAGES).empty();
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
            this.serverSocket.emit(events.EVENTS.CHANNEL, channel_id);
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
