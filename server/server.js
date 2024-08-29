// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"],
  },
});

// Middleware to parse JSON bodies
app.use(express.json());

// HTTP POST endpoint to receive data and emit it via Socket.IO
app.post('/send-data', (req, res) => {
  const data = req.body;
  console.log('Received data via POST:', data);
  
  // Emit the data to all connected clients
  io.emit('update', data);
  
  res.status(200).send('Data received and broadcasted');
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
