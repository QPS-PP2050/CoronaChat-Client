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
    win;
    
    constructor(){}
    
    //Deals with connecting to the server
    connect(server)
    {
        this.manager = io.Manager('https://localhost:8080', {reconnect: true});
        this.socket = this.manager.socket('/');
        
        console.log(this.socket);

        this.socket.on(CHATEVENT.CONNECT, () => {
             
            this.socket.on('message', (data) => {
                console.log(data);
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
        if(this.socket)
        {
            this.socket.emit(CHATEVENT.MESSAGE, {author: data.username, message: data.msg});
        }
    }
    
    //Changes the server
    connectServer(server)
    {
        this.socket = this.manager.socket(server);
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