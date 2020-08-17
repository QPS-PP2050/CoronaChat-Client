const io = require('socket.io-client');

class SocketConnect
{
    constructor() { }

    async connect(url, port)
    {
        console.log(`${url}:${port}`);
        this.socket = io(`ws://${url}:${port}`);
        this.socket.on('connect', () => {
            this.socket.on('message', (data) => {
                console.log(data);
            });
        });
    }
    async send(msg)
    {
        this.socket.emit('message', msg);
    }
}

exports.SocketConnect = SocketConnect;