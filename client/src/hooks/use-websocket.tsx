import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
}

export type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed';

export const useWebSocket = (exerciseId: number, userId: number, username: string, options?: WebSocketOptions) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [messages, setMessages] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<{userId: number, username: string}[]>([]);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = options?.reconnectAttempts || 5;
  const reconnectInterval = options?.reconnectInterval || 3000;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      setStatus('connecting');

      socket.onopen = (event) => {
        setStatus('open');
        reconnectAttemptsRef.current = 0;
        
        // Join the exercise room
        const joinMessage = {
          type: 'join',
          userId,
          username,
          exerciseId
        };
        socket.send(JSON.stringify(joinMessage));
        
        if (options?.onOpen) {
          options.onOpen(event);
        }
      };

      socket.onclose = (event) => {
        setStatus('closed');
        
        if (options?.onClose) {
          options.onClose(event);
        }
        
        // Try to reconnect if not closed deliberately
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, reconnectInterval);
        } else {
          toast({
            title: "Connection lost",
            description: "Could not reconnect to collaboration server. Refresh the page to try again.",
            variant: "destructive"
          });
        }
      };

      socket.onerror = (event) => {
        if (options?.onError) {
          options.onError(event);
        }
        
        toast({
          title: "Connection error",
          description: "There was an error with the collaboration connection.",
          variant: "destructive"
        });
      };

      socket.onmessage = (event) => {
        if (options?.onMessage) {
          options.onMessage(event);
        }
        
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'joined':
              setActiveUsers(data.users || []);
              break;
              
            case 'user-joined':
            case 'user-left':
              setActiveUsers(data.users || []);
              // Also add these events to messages for the activity feed
              setMessages((prev) => [...prev, data]);
              break;
              
            case 'solution-updated':
            case 'new-comment':
              setMessages((prev) => [...prev, data]);
              break;
              
            case 'pong':
              // Just a keepalive response, no action needed
              break;
              
            default:
              console.log('Unknown message type:', data);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast({
        title: "Connection error",
        description: "Failed to establish collaboration connection.",
        variant: "destructive"
      });
    }
  }, [wsUrl, exerciseId, userId, username, options, toast, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Send leave message before closing
      const leaveMessage = {
        type: 'leave',
        userId,
        username,
        exerciseId
      };
      socketRef.current.send(JSON.stringify(leaveMessage));
      
      socketRef.current.close();
      setStatus('closing');
    }
  }, [exerciseId, userId, username]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type,
        userId,
        username,
        exerciseId,
        ...payload,
        timestamp: new Date().toISOString()
      };
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    
    toast({
      title: "Connection error",
      description: "Cannot send message. You are not connected to the collaboration server.",
      variant: "destructive"
    });
    return false;
  }, [exerciseId, userId, username, toast]);

  const updateSolution = useCallback((solution: string) => {
    return sendMessage('update-solution', { solution });
  }, [sendMessage]);

  const addComment = useCallback((comment: string) => {
    return sendMessage('comment', { comment });
  }, [sendMessage]);

  // Connect when component mounts and disconnect when it unmounts
  useEffect(() => {
    connect();
    
    // Send a ping every 30 seconds to keep the connection alive
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    status,
    messages,
    activeUsers,
    sendMessage,
    updateSolution,
    addComment
  };
};