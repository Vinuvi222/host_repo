import WebSocket from 'ws';

const ws = new WebSocket('ws://172.20.10.10:8081');


ws.on('open', () => console.log('✅ Connected to WebSocket'));

ws.on('message', (data) => {
  const busData = JSON.parse(data);
  console.log('📍 New message from server:', busData);
});

ws.on('close', () => console.log('❌ WebSocket connection closed'));
ws.on('error', (err) => console.log('⚠️ WebSocket error:', err.message));
 
