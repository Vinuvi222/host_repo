import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8081, host: '0.0.0.0' }); // ✅ listen on all network interfaces
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Passenger connected via WebSocket');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Passenger disconnected');
    clients.delete(ws);
  });
});

export function broadcastBusLocation(busData) {
  const data = JSON.stringify(busData);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

console.log('WebSocket server running on ws://0.0.0.0:8081');


