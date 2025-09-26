let socket;

export function initWebSocket(onMessage) {
  socket = new WebSocket('ws://localhost:3000/ws');

  socket.onopen = () => {
    console.log('🔗 WebSocket connected');
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📩 WS Message:', data);
    if (onMessage) onMessage(data);
  };

  socket.onclose = () => {
    console.log('❌ WebSocket closed');
  };

  socket.onerror = (err) => {
    console.error('⚠️ WebSocket error:', err);
  };
}

export function sendWSMessage(msg) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}