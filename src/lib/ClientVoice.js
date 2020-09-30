const mediasoupClient = require('mediasoup-client');

class ClientVoice
{
    constructor(server_id, channel_id, socket, audio)
    {
        this.socket = socket;
        this.server_id = server_id;
        this.channel_id = channel_id;
        this.audio = audio;
        this.producerTrans = null;
        this.comsumerTrans = null;
        this.mediasoupClient = mediasoupClient;


        this.consumers = new Map();
        this.producers = new Map();

        this.producerLabel = new Map();

        this.isOpen = false;
        this.eventListeners = new Map();

        this.createRoom(server_id, channel_id).then(async function () {
            await this.join(name, room_id)
            this.initSockets()
            this._isOpen = true
            successCallback()
        }.bind(this))
    }

    async createRoom(server_id, channel_id) {
        await this.socket.emit("createRoom" , {
            server_id, channel_id
        }).catch(err => {
            console.log(err)
        })
    }
}

exports.ClientVoice = ClientVoice;