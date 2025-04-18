import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if socket.io server is already initialized
    if (!(res.socket as any).server.io) {
      console.log('Initializing socket.io server...');
      
      // Create Socket.IO server with proper configuration
      const io = new Server((res.socket as any).server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['polling', 'websocket'],
        allowEIO3: true
      });
      
      // Store rooms data
      const rooms = new Map();
      // Track sent notifications to prevent duplicates
      const sentNotifications = new Map();

      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        
        let userId;
        let roomId;
        let isHost = false;
        
        // Join room
        socket.on('join', (data) => {
          try {
            const { roomId: room, userId: user, isHost: host, userName } = data;
            roomId = room;
            userId = user;
            isHost = host;
            
            console.log(`User ${userId} joining room ${roomId}, isHost: ${isHost}`);
            
            // Add user to room
            socket.join(roomId);
            
            // Initialize room if it doesn't exist
            if (!rooms.has(roomId)) {
              rooms.set(roomId, {
                host: isHost ? { socketId: socket.id, userId, userName } : null,
                participants: new Map(),
                waitingParticipants: new Map()
              });
              console.log(`Created new room ${roomId}`);
            }
            
            const roomData = rooms.get(roomId);
            
            if (isHost) {
              // Set this socket as the host
              roomData.host = { socketId: socket.id, userId, userName };
              roomData.participants.set(userId, { socketId: socket.id, userName });
              
              console.log(`Host ${userId} joined room ${roomId}`);
              
              // Initialize notification tracking for this host if needed
              if (!sentNotifications.has(socket.id)) {
                sentNotifications.set(socket.id, new Set());
              }
              
              // Send waiting participants to host (only ones not already notified)
              if (roomData.waitingParticipants.size > 0) {
                console.log(`Room ${roomId} has ${roomData.waitingParticipants.size} waiting participants`);
                
                // Get the set of notifications already sent to this host
                const notifiedList = sentNotifications.get(socket.id);
                
                // Send notifications for participants not already notified
                roomData.waitingParticipants.forEach((participant, id) => {
                  const notificationId = `${roomId}:${id}`;
                  if (!notifiedList.has(notificationId)) {
                    console.log(`Notifying host about waiting participant ${id}`);
                    socket.emit('waiting', {
                      userId: id,
                      userName: participant.userName,
                      notificationId
                    });
                    notifiedList.add(notificationId);
                  }
                });
              }
            } else {
              // Non-host participant logic
              // If room has a host, add to waiting room
              if (roomData.host) {
                // Add/update participant in waiting room
                roomData.waitingParticipants.set(userId, { socketId: socket.id, userName });
                
                console.log(`Participant ${userId} added to waiting room for ${roomId}`);
                
                // Create a unique notification ID
                const notificationId = `${roomId}:${userId}`;
                
                // Get the set of notifications sent to the host
                let hostNotifications = sentNotifications.get(roomData.host.socketId);
                if (!hostNotifications) {
                  hostNotifications = new Set();
                  sentNotifications.set(roomData.host.socketId, hostNotifications);
                }
                
                // Only send notification if not already sent
                if (!hostNotifications.has(notificationId)) {
                  console.log(`Sending waiting notification to host for ${userId}`);
                  io.to(roomData.host.socketId).emit('waiting', {
                    userId,
                    userName,
                    notificationId
                  });
                  hostNotifications.add(notificationId);
                } else {
                  console.log(`Skipping duplicate notification for ${userId}`);
                }
              } else {
                // No host yet, add as normal participant
                roomData.participants.set(userId, { socketId: socket.id, userName });
                console.log(`Participant ${userId} joined room ${roomId} (no host yet)`);
              }
            }
            
            // Send confirmation to the client
            socket.emit('joined', { success: true, roomId });
          } catch (err) {
            console.error('Error in join handler:', err);
            socket.emit('error', { message: 'Failed to join room' });
          }
        });
        
        // Handle leave event
        socket.on('leave', (data) => {
          const { roomId, userId } = data;
          console.log(`Processing leave event for user ${userId} in room ${roomId}`);
          const room = rooms.get(roomId);

          if (room) {
            // Remove from waiting participants
            if (room.waitingParticipants.has(userId)) {
              room.waitingParticipants.delete(userId);
            }

            // Notify the host about the participant leaving
            if (room.host) {
              io.to(room.host.socketId).emit('user-left', { userId });
            }

            console.log(`User ${userId} left room ${roomId}`);
          }
        });

        // Clean up notifications when a socket disconnects
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
          
          // Remove notification tracking
          sentNotifications.delete(socket.id);
          
          if (userId && roomId) {
            const clientKey = `${userId}:${roomId}`;
            
            if (rooms.has(roomId)) {
              const room = rooms.get(roomId);
              
              // Remove from participants
              if (userId && room.participants.has(userId)) {
                room.participants.delete(userId);
                
                // Notify others
                socket.to(roomId).emit('user-left', { userId });
              }
              
              // Remove from waiting participants
              if (userId && room.waitingParticipants.has(userId)) {
                room.waitingParticipants.delete(userId);
              }
              
              // If host disconnects, clean up
              if (room.host && room.host.userId === userId) {
                room.host = null;
              }
              
              // Delete room if empty
              if (room.participants.size === 0 && room.waitingParticipants.size === 0) {
                rooms.delete(roomId);
              }
            }
          }
        });

        // Handle signaling messages
        socket.on('offer', (data) => forwardMessage(socket, 'offer', data));
        socket.on('answer', (data) => forwardMessage(socket, 'answer', data));
        socket.on('ice-candidate', (data) => forwardMessage(socket, 'ice-candidate', data));
        
        // Handle waiting room actions
        socket.on('admit', (data) => {
          const { roomId, targetUserId } = data;
          const room = rooms.get(roomId);
          
          if (!room) return;
          
          const participant = room.waitingParticipants.get(targetUserId);
          if (participant) {
            // Move to participants
            room.participants.set(targetUserId, participant);
            room.waitingParticipants.delete(targetUserId);
            
            // Notify participant that they're admitted
            io.to(participant.socketId).emit('admitted');
            
            // IMPORTANT: Notify the new participant about ALL existing participants
            // Including the host and other participants
            room.participants.forEach((p, id) => {
              // Don't notify about themselves
              if (id !== targetUserId) {
                console.log(`Notifying new participant ${targetUserId} about existing participant ${id}`);
                io.to(participant.socketId).emit('user-joined', {
                  userId: id,
                  userName: p.userName
                });
              }
            });
            
            // IMPORTANT: Notify ALL existing participants about the new participant
            room.participants.forEach((p, id) => {
              // Don't notify themselves
              if (id !== targetUserId) {
                console.log(`Notifying existing participant ${id} about new participant ${targetUserId}`);
                io.to(p.socketId).emit('user-joined', {
                  userId: targetUserId,
                  userName: participant.userName
                });
              }
            });
          }
        });
        
        socket.on('reject', (data) => {
          const { roomId, targetUserId } = data;
          const room = rooms.get(roomId);
          
          if (!room) return;
          
          const participant = room.waitingParticipants.get(targetUserId);
          if (participant) {
            io.to(participant.socketId).emit('rejected');
            room.waitingParticipants.delete(targetUserId);
          }
        });
        
        // Handle media state changes
        socket.on('media-state', (data) => {
          const { roomId, userId, audioEnabled, videoEnabled } = data;
          console.log(`User ${userId} in room ${roomId} changed media state: audio=${audioEnabled}, video=${videoEnabled}`);
          
          const room = rooms.get(roomId);
          if (!room) return;
          
          // Forward to all other participants in the room
          room.participants.forEach((participant, id) => {
            if (id !== userId) {
              io.to(participant.socketId).emit('media-state-changed', {
                userId,
                audioEnabled,
                videoEnabled
              });
            }
          });
        });
        
        // Helper function to forward messages
        function forwardMessage(socket, messageType, data) {
          const { roomId, targetUserId } = data;
          const room = rooms.get(roomId);
          
          if (!room) return;
          
          const target = room.participants.get(targetUserId);
          if (target) {
            io.to(target.socketId).emit(messageType, data);
          }
        }
      });

      // Store the io instance
      (res.socket as any).server.io = io;
      
      console.log('Socket.IO server initialized');
    } else {
      console.log('Socket.IO already running');
    }
    
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error in signaling API:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
