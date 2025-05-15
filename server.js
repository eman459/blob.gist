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

    for (const [otherId, client] of players) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  });

  ws.on('close', () => {
    players.delete(id);
    for (const client of players.values()) {
      client.send(JSON.stringify({ type: 'remove', id }));
    }
  });
});

console.log('✅ Server running at ws://localhost:8080');
