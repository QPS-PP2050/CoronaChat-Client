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
        this.socket = io(`ws://${this.URL}:${this.PORT}${server}`, {
            forceNew: true
        });
        
        this.socket.connect();

        this.socket.on(CHATEVENT.CONNECT, () => {
             
            this.socket.on(CHATEVENT.MESSAGE, (data) => {
                //Everytime a message comes through this function gets used to update the ui
                console.log("Test");
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
            this.socket.on(CHATEVENT.DISCONNECT, function(){
                this.socket = null;
            });
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
            console.log(data);
            this.socket.emit(CHATEVENT.MESSAGE, {author: data.username, message: data.msg});
        }
    }
    
    connectServer(server)
    {  
        //this.socket.emit(CHATEVENT.DISCONNECT);
        this.socket.close();
        this.connect(server);
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