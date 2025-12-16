// src/hooks/useChatSocket.js
import { useEffect, useRef, useState } from 'react';
import { createMockSocket } from '../utils/mockWs';

export default function useChatSocket({ wsUrl = null, token = null, onMessage }) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = wsUrl ? new WebSocket(wsUrl) : createMockSocket();
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (evt) => onMessage && onMessage(JSON.parse(evt.data));
    ws.onclose = () => setConnected(false);

    return () => { ws.close(); setConnected(false); }
  }, [wsUrl, token, onMessage]);

  const send = (obj) => {
    if(wsRef.current && wsRef.current.readyState === 1) wsRef.current.send(JSON.stringify(obj));
  }

  return { connected, send };
}
