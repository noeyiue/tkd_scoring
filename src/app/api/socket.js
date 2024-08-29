import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected');
      
      // Listen for messages from the client
      socket.on('data', (data) => {
        console.log('Received data:', data);
        // Broadcast the data to all connected clients
        io.emit('update', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
};

export default ioHandler;
