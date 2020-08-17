const io = require('socket.io-client');

const CHATEVENT = 
{
    CONNECT : 'connect',
    DISCONNECT : 'disconnect',
    MESSAGE : 'message'
}

class SocketConnect
{
    PORT = 8080;
    URL = "coronachat.xyz";
    socket;


    constructor()
    {
        this.socket = io(`${this.URL}:${this.PORT}`);
    }

    async connect()
    {
        this.socket.on(CHATEVENT.CONNECT, () => {
                
        });
        
        this.socket.on(CHATEVENT.MESSAGE, (data) => {
                
        });
    }

    async disconnect()
    {
        this.socket.emit(CHATEVENT.disconnect);
        this.socket.close();
    }

    async send(msg)
    {
        this.socket.emit(CHATEVENT.MESSAGE, msg);
    }
}

exports.SocketConnect = SocketConnect;