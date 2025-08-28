import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to Socket.IO server');
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Disconnected from Socket.IO server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join', userId);
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onBookingUpdate(callback) {
    if (this.socket) {
      this.socket.on('booking_update', callback);
    }
  }

  onPaymentUpdate(callback) {
    if (this.socket) {
      this.socket.on('payment_update', callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
