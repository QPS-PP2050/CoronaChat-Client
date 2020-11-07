const io = require('socket.io-client/dist/socket.io');
const { dialog } = require('electron');
const { ClientVoice } = require('./ClientVoice');
const { timers } = require('jquery');
var $, jQuery;
$ = jQuery = require('jquery');
const events = require('./types/types');
const Store = require('electron-store');
const mediaSoup = require('mediasoup-client');
const store = new Store();

let window;

class ClientSocket {
    socketList = {};
    PORT = 8080;
    URL = "localhost";//"coronachat.xyz";
    socket;
    serverSocket;
    server_id;
    voicesocket
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
        this.socket.on(events.EVENTS.CONNECT, () => {

            this.socket.on('profile', (data) => {
                // data directly provides profile URL
                $('#profile-image').attr("src", data);
            })

            this.socket.on(events.EVENTS.SERVER, (data) => {
                $('#server').empty();
                data.forEach(item => {
                    $('#server').append(`<a class="init" data-name="${item.name}" data-server="${item.id}">${item.name}</a>`);
                });
            });
            this.socket.on('private-message', (data) => {
                
            });
        });
    }

    //Updates chat channels
    updateChannel() {
        if (this.serverSocket) {
            this.serverSocket.emit('update-channels');
        }
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
        //checks if ueser is already in the server  
        if (this.server_id == server.id)
            return;

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
        this.server_id = server.id

        console.log(this.socketList)
        if (!this.serverSocket.firstConnect && !this.serverSocket.ready) {
            console.log('connecting socket');
            this.serverSocket.connect();
        }

        this.voicesocket = this.manager.socket(`/voice`);
        this.clientVoice = new ClientVoice($('remote-audio'), mediaSoup, this.voicesocket, server.id, store.get('token').username);

        console.log(this.clientVoice)
        //When connection to server is established, shows the server name
        this.serverSocket.on(events.EVENTS.CONNECT, () => {
            this.server_id = server.id;
            this.serverSocket.ready = true;
            $('#server-name').text(`${server.name}`);
        
        });

        //Updates the channel list
        this.serverSocket.on(events.EVENTS.CHANNELS, (data) => {
            $('#channel-list').empty();
            data.forEach(channel => {
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
        });

        //Updates UI when a member disconnects and reconnects
        this.serverSocket.on(events.EVENTS.MEMBER_UPDATE, (list) => {
            $(events.UI.MEMBER_LIST).empty();
            list.forEach(member => {
                $(events.UI.MEMBER_LIST).append(`<li><span class="member"><img src="${member.avatarURL}"><a data-user="${member.id}">${member.username}</a></span></li>`);
            });
        });
        //Deals with clearing the socket when disconnecting
        this.serverSocket.on('disconnect', () => {
            this.serverSocket.ready = false;
            this.serverSocket.removeAllListeners();
        });
    }
 
    //Clears messages on the screen
    clearMessages() {
        $(events.UI.MESSAGES).empty();
        $('#chat-title').empty();
        $('#chat-title').append(`<p>${this.channel}</p>`);
    }

    //Changes channel
    changeChannel(channel) {
        if (this.serverSocket) {
            if (channel.id == this.chanel_id)
                return;
            this.channel = channel.name;
            this.clearMessages();
            this.chanel_id = channel.id;
            this.serverSocket.emit(events.EVENTS.CHANNEL, `${channel.id}`);
        }
    }
    
    //Deals with creating the voice connection with the ClientVoice
    joinVoice(server_id, channel_id, audio, mediasoupClient) {
        if (this.manager) {
            this.voicesocket = this.manager.socket(`/voice`);
            //Modified version of PeerRoom from https://github.com/Dirvann/mediasoup-sfu-webrtc-video-rooms, All credit belongs to Dirvann
            this.clientVoice = new ClientVoice(audio, mediasoupClient, this.voicesocket, channel_id, name);
        }
    }

    //Starts the voice connection
    startVoice() {
        if (this.clientVoice) {
            console.log(this.clientVoice)
            this.clientVoice.produce('audioType', store.get('mic'));
        }
    }

    //Stops the voice connection
    stopVoice() {
        if (this.clientVoice) {
            this.clientVoice.closeProducer('audioType');
            this.clientVoice.exit();
        }
    }
}
exports.ClientSocket = ClientSocket;
