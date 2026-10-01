import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinOrderRoom: (orderId: string) => void;
  joinRestaurantRoom: (restaurantId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user, restaurantId } = useAuth();

  useEffect(() => {
    // Connect to server Socket.IO
    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      if (user?.id) {
        newSocket.emit('join_user', user.id);
      }
      if (restaurantId) {
        newSocket.emit('join_restaurant', restaurantId);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, restaurantId]);

  const joinOrderRoom = (orderId: string) => {
    socket?.emit('join_order', orderId);
  };

  const joinRestaurantRoom = (restId: string) => {
    socket?.emit('join_restaurant', restId);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom, joinRestaurantRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
