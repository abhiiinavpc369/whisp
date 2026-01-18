// users.controller.js
import {
  getUserProfile,
  updateUserProfile,
  searchUsers as searchUsersService,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests
} from './users.service.js';

/* ─────────────────────────────
   PROFILE
───────────────────────────── */

// Get my profile
export async function getProfile(req, res) {
  try {
    const user = await getUserProfile(req.user.userId);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
}

// Update my profile
export async function updateProfile(req, res) {
  try {
    const user = await updateUserProfile(
      req.user.userId,
      req.body
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

/* ─────────────────────────────
   SEARCH
───────────────────────────── */

// Search users
export async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const users = await searchUsersService(q);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

/* ─────────────────────────────
   FRIEND SYSTEM
───────────────────────────── */

// Send friend request
export async function sendRequest(req, res) {
  try {
    const { userId } = req.params;
    await sendFriendRequest(req.user.userId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Accept friend request
export async function acceptRequest(req, res) {
  try {
    const { userId } = req.params;
    await acceptFriendRequest(req.user.userId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Reject friend request
export async function rejectRequest(req, res) {
  try {
    const { userId } = req.params;
    await rejectFriendRequest(req.user.userId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Cancel sent request
export async function cancelRequest(req, res) {
  try {
    const { userId } = req.params;
    await cancelFriendRequest(req.user.userId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

// Get friends list
export async function getMyFriends(req, res) {
  try {
    const friends = await getFriends(req.user.userId);
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
}

// Get pending friend requests
export async function getRequests(req, res) {
  try {
    const requests = await getFriendRequests(req.user.userId);
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: err.message });
  }
}
