const io = require('socket.io-client');
const { dialog } = require('electron');
const ClientVoice = require('./ClientVoice');
const { timers } = require('jquery');
var $, jQuery;
$ = jQuery = require('jquery');
const events = require('./types/types');

let window;

class ClientSocket {
    socketList = {};
    PORT = 8080;
    URL = "localhost";//"coronachat.xyz";
    socket;
    serverSocket;
    win;
    channel = "";
    constructor() { }

    //Deals with connecting to the server
    connect(socksess) {
        this.manager = io.Manager('https://8080-bacf873d-5771-49a9-a3e5-e599ef547c22.ws-us02.gitpod.io', {
            reconnect: true,
            transportOptions: {
                polling: {
                    extraHeaders: { Authorization: `Bearer ${socksess.token}` }
                }
            }
        });

        this.socket = this.manager.socket('/')
        // this.serverSocket = this.manager.socket('/')
        this.socket.on(events.EVENTS.CONNECT, () => 
        {
            this.socket.on(events.EVENTS.SERVER, (data) => {
                console.log(data);
                $('#server').empty();
                for(var server of data)
                {
                    $('#server').append(`<a class="init" data-server="${server.id}">${server.name}</a>`);
                }
            });
        });
    }

    //Disconects from Server
    disconnect() {
        if (this.socket)
            this.socket.disconnect();
        if (this.socketList.length > 0) {
            for (var socket in this.socketList)
                socket.disconnect();
        }
    }

    //Sends message to the server
    send(data) {
        if (this.serverSocket) {
            this.serverSocket.emit(events.EVENTS.MESSAGE, { channel: this.channel, author: data.username, message: data.msg });
        }
    }

    //Changes the server
    connectServer(server) {
        if (!this.socketList[`/${server}`]) {
            this.socketList[`/${server}`] = this.manager.socket(`/${server}`);
            this.socketList[`/${server}`].firstConnect = true;
            this.socketList[`/${server}`].ready = false;
        }

        this.channel = 'general';
        this.clearMessages();

        if (this.serverSocket) {
            this.serverSocket.firstConnect = false
            this.serverSocket.close();
        }

        this.serverSocket = this.socketList[`/${server}`];

        console.log(this.socketList)
        if (!this.serverSocket.firstConnect && !this.serverSocket.ready) {
            console.log('connecting socket');
            this.serverSocket.connect();
        }

        this.serverSocket.on(events.EVENTS.CONNECT, () => {
            this.serverSocket.ready = true;
        });

        this.serverSocket.on(events.EVENTS.CHANNELS, (data) => { 
            $('#channel-list').empty();
            for(var channel of data)
            {
                $('#channel-list').append(`<li><a class="join-channel" data-type="${data.type}" data-channel="${data.id}">${data.name}</a></li>`)
            }
        });

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
            for (var i = 0; i < list.length; i++) {
                $(events.UI.MEMBER_LIST).append(`<li><a>${list[i]}</a></li>`);
            }
        });
        this.serverSocket.on('disconnect', () => {
            this.serverSocket.ready = false;
            this.serverSocket.removeAllListeners();
        });
    }

    clearMessages() {
        $(events.UI.MESSAGES).empty();
        $('#chat-title').empty();
        $('#chat-title').append(`<p>${this.channel}</p>`);
    }

    //Changes channel
    changeChannel(channel_id) {
        if (this.serverSocket) {
            this.channel = channel_id;
            this.clearMessages();
            this.serverSocket.emit(events.EVENTS.CHANNEL, `${channel_id}`);
        }
    }

    joinVoice(server_id, channel_id, audio, mediasoupClient) {
        if (this.manager) {
            this.voicesocket = this.manager.socket(`/${server_id}`)
            this.clientVoice = new ClientVoice(audio, mediasoupClient, this.serverSocket, channel_id, name);
        }
    }

    startVoice()
    {
        if(this.clientVoice)
        {
            this.clientVoice.produce('startAudio', store.get('mic'));
        }
    }
    
    stopVoice()
    {
        if(this.clientVoice)
        {
            this.clientVoice.closeProducer('stopAudio');
            this.clientVoice.exit();
        }
    }
}
exports.ClientSocket = ClientSocket;
