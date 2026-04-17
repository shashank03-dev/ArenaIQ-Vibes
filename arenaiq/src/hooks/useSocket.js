import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to same origin — Vite's proxy forwards /socket.io → :8080 in dev
//                          production: served from same Express server
const URL = undefined;

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [fanAlert, setFanAlert] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(URL);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('state_update', (state) => {
      setGameState(state);
    });

    socketInstance.on('fan_alert', (alert) => {
      setFanAlert(alert);
      // Clear alert after 10 seconds
      setTimeout(() => setFanAlert(null), 10000);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const simulateRush = () => {
    if (socket) {
      socket.emit('simulate_rush');
    }
  };

  return { isConnected, gameState, fanAlert, simulateRush };
}
