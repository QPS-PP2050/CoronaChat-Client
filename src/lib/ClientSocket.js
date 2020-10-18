const io = require('socket.io-client/dist/socket.io');
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
        this.manager = io.Manager('https://coronachat.xyz:8080', {
            reconnect: true,
            transportOptions: {
                polling: {
                    extraHeaders: { Authorization: `Bearer ${socksess.token}` }
                }
            }
        });
        this.socket = this.manager.socket('/');
        // this.serverSocket = this.manager.socket('/')
        this.socket.on(events.EVENTS.CONNECT, () => 
        {
            this.socket.on(events.EVENTS.SERVER, (data) => {
                
                $('#server').empty();
                data.forEach(item => {
                    $('#server').append(`<a class="init" data-name="${item.name}" data-server="${item.id}">${item.name}</a>`);
                });
            });
            this.socket.on('username', (data) =>{
                
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
            this.serverSocket.emit(events.EVENTS.MESSAGE, { channel: this.chanel_id, author: data.username, message: data.msg });
        }
    }

    push(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    //Changes the server
    connectServer(server) {
        console.log(server.id);
        if (!this.socketList[`/${server.id}`]) {
            this.socketList[`/${server.id}`] = this.manager.socket(`/${server.id}`);
            this.socketList[`/${server.id}`].firstConnect = true;
            this.socketList[`/${server.id}`].ready = false;
        }
        


        if (this.serverSocket) {
            this.serverSocket.firstConnect = false
            this.serverSocket.close();
        }

        this.serverSocket = this.socketList[`/${server.id}`];

        console.log(this.socketList)
        if (!this.serverSocket.firstConnect && !this.serverSocket.ready) {
            console.log('connecting socket');
            this.serverSocket.connect();
        }

        this.serverSocket.on(events.EVENTS.CONNECT, () => {
            this.serverSocket.ready = true;
            $('#server-name').text(`${server.name}`);
        });

        this.serverSocket.on(events.EVENTS.CHANNELS, (data) => {
            $('#channel-list').empty();
            data.forEach(channel =>{
                if (channel.name === 'general') {
                    this.clearMessages();
                    this.changeChannel(channel)
                }
                $('#channel-list').append(`<li><a class="join-channel" data-name="${channel.name}" data-type="${channel.type}" data-channel="${channel.id}">${channel.name}</a></li>`);
            });
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
    changeChannel(channel) {
        if (this.serverSocket) {
            this.channel = channel.name;
            this.clearMessages();
            this.chanel_id = channel.id;
            this.serverSocket.emit(events.EVENTS.CHANNEL, `${channel.id}`);
        }
    }

    joinVoice(server_id, channel_id, audio, mediasoupClient) {
        if (this.manager) {
            this.voicesocket = this.manager.socket(`/${server_id}`);
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
