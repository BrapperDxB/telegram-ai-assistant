import { useState, useEffect, useRef } from 'react';
import { ConnectionStatus } from '../types';

export const useWebSocket = (url: string | null) => {
  const [status, setStatus] = useState<ConnectionStatus>('uninstantiated');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing reconnect timeouts when URL changes or component unmounts
    if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
    }
      
    if (!url) {
      if (ws.current) {
          ws.current.close();
          ws.current = null;
      }
      setStatus('uninstantiated');
      return;
    }
    
    let isMounted = true;

    const connect = () => {
      if (!url || !isMounted) return;

      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
          return;
      }

      ws.current = new WebSocket(url);
      if (isMounted) setStatus('connecting');

      ws.current.onopen = () => {
        if (isMounted) {
            console.log('WebSocket connected');
            setStatus('open');
        }
      };

      ws.current.onmessage = (event) => {
        if (isMounted) setLastMessage(event.data);
      };

      ws.current.onclose = () => {
        if (isMounted) {
            console.log('WebSocket disconnected');
            setStatus('closed');
            // Schedule a reconnect attempt
            reconnectTimeout.current = setTimeout(connect, 5000); // try to reconnect every 5 seconds
        }
      };
      
      ws.current.onerror = (error) => {
          if (isMounted) {
            console.error('WebSocket error:', error);
            // onclose will be called subsequently, triggering reconnect logic
          }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
        setStatus('closing');
      }
    };
  }, [url]);

  return { connectionStatus: status, lastMessage };
};
