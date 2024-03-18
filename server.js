const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let drawings = [];

io.on('connection', (socket) => {

  socket.on('playerJoined', (playerName) => {
    io.emit('playerJoined', playerName);
    console.log('user connected');
  });

  socket.on('playerLeft', (playerName) => {
    io.emit('playerLeft', playerName);
    console.log('user disconnected');
  });

  // Odešli předchozí tahy novému uživateli
  drawings.forEach((drawing) => {
    socket.emit(drawing.type, drawing.data);
  });

  socket.on('draw', (data) => {
    drawings.push({ type: 'draw', data });
    socket.broadcast.emit('draw', data);
  });

  socket.on('drawRect', (data) => {
    drawings.push({ type: 'drawRect', data });
    socket.broadcast.emit('drawRect', data);
  });

  socket.on('clear', () => {
    drawings = [];
    io.emit('clear');
  });

  socket.on('chat', (data) => {
    io.emit('chat', data);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});