import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from './env';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join customer/user private room
    socket.on('join_user', (userId: string) => {
      socket.join(`user_${userId}`);
    });

    // Join restaurant staff/manager room
    socket.on('join_restaurant', (restaurantId: string) => {
      socket.join(`restaurant_${restaurantId}`);
    });

    // Join specific waiter room
    socket.on('join_waiter', (waiterId: string) => {
      socket.join(`waiter_${waiterId}`);
    });

    // Join specific order tracking room
    socket.on('join_order', (orderId: string) => {
      socket.join(`order_${orderId}`);
    });

    // Join delivery live tracker
    socket.on('join_delivery', (deliveryId: string) => {
      socket.join(`delivery_${deliveryId}`);
    });

    // Delivery location broadcast
    socket.on('update_location', (data: { deliveryId: string; orderId: string; lat: number; lng: number; eta: string }) => {
      io?.to(`delivery_${data.deliveryId}`).emit('delivery_location_update', data);
      io?.to(`order_${data.orderId}`).emit('delivery_location_update', data);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initSocket first.');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  io?.to(`user_${userId}`).emit(event, data);
};

export const emitToRestaurant = (restaurantId: string, event: string, data: any) => {
  io?.to(`restaurant_${restaurantId}`).emit(event, data);
};

export const emitToOrder = (orderId: string, event: string, data: any) => {
  io?.to(`order_${orderId}`).emit(event, data);
};
