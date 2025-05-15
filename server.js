const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });
const players = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  players.set(id, ws);
  ws.send(JSON.stringify({ type: 'init', id }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    data.id = id;
    broadcast(JSON.stringify(data), id);
  });

  ws.on('close', () => {
    players.delete(id);
    broadcast(JSON.stringify({ type: 'remove', id }), id);
  });
});

function broadcast(message, exceptId) {
  for (const [id, ws] of players) {
    if (id !== exceptId && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

console.log('Server running at ws://localhost:8080');
