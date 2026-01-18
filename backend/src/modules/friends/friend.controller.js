// friend.controller.js
import { Friend } from './friend.model.js';

// Send request
export async function sendRequest(req, res) {
  const { userId } = req.params;
  const request = await Friend.create({ from: req.user.userId, to: userId });
  res.json(request);
}

// Accept request
export async function acceptRequest(req, res) {
  const { requestId } = req.params;
  const request = await Friend.findByIdAndUpdate(
    requestId,
    { status: 'accepted' },
    { new: true }
  );
  res.json(request);
}

// Reject request
export async function rejectRequest(req, res) {
  const { requestId } = req.params;
  const request = await Friend.findByIdAndUpdate(
    requestId,
    { status: 'rejected' },
    { new: true }
  );
  res.json(request);
}

// Get friend list
export async function getFriends(req, res) {
  const friends = await Friend.find({
    $or: [
      { from: req.user.userId, status: 'accepted' },
      { to: req.user.userId, status: 'accepted' }
    ]
  }).populate('from to', 'username displayName avatarUrl color');
  res.json(friends);
}
