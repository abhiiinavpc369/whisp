// src/modules/chat/chat.socket.js
import { Message } from '../messages/message.model.js';
import { User } from '../users/user.model.js';

/**
 * Socket user map
 * userId => socketId
 */
const onlineUsers = new Map();

export default function chatSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    /* ───────── USER ONLINE ───────── */
    socket.on('user:online', async (userId) => {
      onlineUsers.set(userId.toString(), socket.id);
      socket.userId = userId;

      // Notify friends
      socket.broadcast.emit('presence:update', {
        userId,
        status: 'online'
      });
    });

    /* ───────── USER OFFLINE ───────── */
    socket.on('disconnect', () => {
      if (!socket.userId) return;

      onlineUsers.delete(socket.userId.toString());

      socket.broadcast.emit('presence:update', {
        userId: socket.userId,
        status: 'offline'
      });

      console.log('🔴 Socket disconnected:', socket.id);
    });

    /* ───────── TYPING INDICATOR ───────── */
    socket.on('typing:start', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:start', {
          from: socket.userId
        });
      }
    });

    socket.on('typing:stop', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:stop', {
          from: socket.userId
        });
      }
    });

    /* ───────── SEND MESSAGE ───────── */
    socket.on('message:send', async ({ to, text, conversationId }) => {
      if (!to || !text || !conversationId) return;

      const message = await Message.create({
        sender: socket.userId,
        recipient: to,
        content: text,
        conversationId,
        status: 'sent'
      });

      const receiverSocket = onlineUsers.get(to);

      // Delivered
      if (receiverSocket) {
        message.status = 'delivered';
        message.deliveredAt = new Date();
        await message.save();

        io.to(receiverSocket).emit('message:receive', message);
      }

      // Echo back to sender
      socket.emit('message:sent', message);
    });

    /* ───────── MESSAGE SEEN ───────── */
    socket.on('message:seen', async ({ conversationId }) => {
      if (!conversationId) return;

      await Message.updateMany(
        {
          conversationId,
          recipient: socket.userId,
          status: { $ne: 'seen' }
        },
        {
          status: 'seen',
          seenAt: new Date()
        }
      );

      // Notify sender
      io.emit('message:seen:update', {
        conversationId,
        seenBy: socket.userId
      });
    });
  });
}
