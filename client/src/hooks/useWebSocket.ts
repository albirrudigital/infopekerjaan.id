import { useState, useEffect, useCallback } from 'react';

interface WebSocketData {
  type: string;
  data: any;
}

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [data, setData] = useState<WebSocketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    const clientId = Math.random().toString(36).substring(7);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // Send client ID in headers
      ws.send(JSON.stringify({
        type: 'subscribe',
        clientId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setData(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setError('Invalid message format');
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocket(null);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000);
    };

    setSocket(ws);
  }, [url]);

  const subscribe = useCallback((companyId?: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        companyId
      }));
    }
  }, [socket]);

  const unsubscribe = useCallback((companyId?: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        companyId
      }));
    }
  }, [socket]);

  useEffect(() => {
    connect();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connect]);

  return {
    data,
    error,
    isConnected,
    subscribe,
    unsubscribe
  };
}; 