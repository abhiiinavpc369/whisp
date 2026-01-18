// chat.socket.js
import { Message } from '../messages/message.model.js';
import { User } from '../users/user.model.js';

/**
 * Online users map
 * userId => socketId
 */
const onlineUsers = new Map();

/**
 * Notify only friends about online/offline status
 */
async function notifyFriendsStatus(userId, status, io) {
  const user = await User.findById(userId).select('friends');
  if (!user) return;

  user.friends.forEach(friendId => {
    const friendSocket = onlineUsers.get(friendId.toString());
    if (friendSocket) {
      io.to(friendSocket).emit('presence:update', {
        userId,
        status
      });
    }
  });
}

export default function chatSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    /* ───────── USER ONLINE ───────── */
    socket.on('user:online', async (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId.toString(), socket.id);
      socket.join(userId.toString());

      await notifyFriendsStatus(userId, 'online', io);
    });

    /* ───────── USER OFFLINE ───────── */
    socket.on('disconnect', async () => {
      if (!socket.userId) return;

      onlineUsers.delete(socket.userId.toString());
      await notifyFriendsStatus(socket.userId, 'offline', io);

      console.log('🔴 Socket disconnected:', socket.id);
    });

    /* ───────── TYPING INDICATOR ───────── */
    socket.on('typing:start', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:start', { from: socket.userId });
      }
    });

    socket.on('typing:stop', ({ to }) => {
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit('typing:stop', { from: socket.userId });
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
    socket.on('message:seen', async ({ messageIds }) => {
      if (!messageIds || !messageIds.length) return;

      await Message.updateMany(
        { _id: { $in: messageIds }, recipient: socket.userId, status: { $ne: 'seen' } },
        { status: 'seen', seenAt: new Date() }
      );

      // Notify only sender of these messages
      messageIds.forEach(async (id) => {
        const msg = await Message.findById(id);
        if (!msg) return;

        const senderSocket = onlineUsers.get(msg.sender.toString());
        if (senderSocket) {
          io.to(senderSocket).emit('message:seen:update', { messageId: id, seenBy: socket.userId });
        }
      });
    });
  });
}
