const socket = io();

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = 'black';
let currentWidth = 2;
let playerName = '';

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', draw);
canvas.addEventListener('mouseover', setMousePosition);

function setMousePosition(e) {
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
  if (!isDrawing) return;

  context.beginPath();
  context.moveTo(lastX, lastY);
  context.lineTo(e.offsetX, e.offsetY);
  context.strokeStyle = currentColor;
  context.lineWidth = currentWidth;
  context.stroke();

  socket.emit('draw', { lastX, lastY, x: e.offsetX, y: e.offsetY, color: currentColor, width: currentWidth });

  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
  isDrawing = false;
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
}

socket.on('clear', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('draw', (data) => {
  context.strokeStyle = data.color;
  context.lineWidth = data.width;
  context.beginPath();
  context.moveTo(data.lastX, data.lastY);
  context.lineTo(data.x, data.y);
  context.stroke();
});

function setColor(color) {
  currentColor = color;
}

function setWidth(width) {
  currentWidth = width;
}

function sendMessage() {
  const message = document.getElementById('chatInput').value;
  if (message.trim() !== '') {
    socket.emit('chat', { playerName, message });
    document.getElementById('chatInput').value = '';
  }
}

socket.on('chat', (data) => {
  const li = document.createElement('li');
  li.innerText = `${data.playerName}: ${data.message}`;
  document.getElementById('messages').appendChild(li);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

socket.on('playerJoined', (playerName) => {
  const li = document.createElement('li');
  li.innerText = `${playerName} joined the game.`;
  document.getElementById('messages').appendChild(li);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

socket.on('playerLeft', (playerName) => {
  const li = document.createElement('li');
  li.innerText = `${playerName} left the game.`;
  document.getElementById('messages').appendChild(li);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

function setPlayerName() {
  playerName = document.getElementById('playerNameInput').value;
  if (playerName.trim() !== '') {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';
    socket.emit('playerJoined', playerName);
  }
}

window.addEventListener('beforeunload', () => {
  socket.emit('playerLeft', playerName);
});

document.getElementById('playerNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    setPlayerName();
  }
});

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

canvas.addEventListener('mousemove', (e) => {
  const brushPreview = document.createElement('div');
  brushPreview.style.position = 'absolute';
  brushPreview.style.width = currentWidth + 'px';
  brushPreview.style.height = currentWidth + 'px';
  brushPreview.style.borderRadius = '50%';
  brushPreview.style.backgroundColor = currentColor;
  brushPreview.style.pointerEvents = 'none';
  brushPreview.style.left = e.clientX - currentWidth / 2 + 'px';
  brushPreview.style.top = e.clientY - currentWidth / 2 + 'px';
  document.body.appendChild(brushPreview);

  setTimeout(() => {
    document.body.removeChild(brushPreview);
  }, 100);
});