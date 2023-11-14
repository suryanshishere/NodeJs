let io;

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: 'http://localhost:3000', // Adjust this to your frontend origin
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true,
            }
        });
        return io;
    },

    getIO: () => {
        if(!io){
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
