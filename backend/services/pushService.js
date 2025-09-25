// Push notification service for real-time alerts
class PushService {
  constructor() {
    this.connections = new Map(); // WebSocket connections
  }

  // Register WebSocket connection for real-time notifications
  registerConnection(userId, ws) {
    this.connections.set(userId, ws);
    
    ws.on('close', () => {
      this.connections.delete(userId);
    });
  }

  // Send notification to specific user
  async sendToUser(userId, notification) {
    const ws = this.connections.get(userId);
    
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
      return true;
    }
    
    return false; // User not connected
  }

  // Broadcast urgent alerts to all connected users
  async broadcastUrgentAlert(notification) {
    const message = JSON.stringify({
      type: 'urgent_alert',
      data: notification
    });

    let sentCount = 0;
    
    for (const [userId, ws] of this.connections) {
      if (ws.readyState === 1) {
        ws.send(message);
        sentCount++;
      }
    }

    return sentCount;
  }

  // Send command to trigger a device's buzzer/vibration
  async sendBuzzerCommand(userId, buzzerConfig) {
    const ws = this.connections.get(userId);
    
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'buzzer',
        data: {
          vibration: buzzerConfig.vibration,
          sound: buzzerConfig.sound,
          duration: buzzerConfig.duration,
          pattern: buzzerConfig.pattern
        }
      }));
      return true;
    }
    
    return false;
  }
}

module.exports = new PushService();