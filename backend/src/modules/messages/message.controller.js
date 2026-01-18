// message.controller.js
import { Message } from './message.model.js';

// Get chat history with friend
export async function getMessages(req, res) {
  const { friendId } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: req.user.userId, recipient: friendId },
      { sender: friendId, recipient: req.user.userId }
    ]
  }).sort({ createdAt: 1 });
  res.json(messages);
}

// Send message
export async function sendMessage(req, res) {
  const { friendId } = req.params;
  const { text } = req.body;
  const message = await Message.create({
    sender: req.user.userId,
    recipient: friendId,
    text
  });
  res.json(message);
}
