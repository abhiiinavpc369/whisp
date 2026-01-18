import { User } from './user.model.js';

/* ─────────────────────────────
   PROFILE
───────────────────────────── */

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId) {
  const user = await User.findById(userId)
    .select('-authProviders -__v');
  if (!user) throw new Error('User not found');
  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId, updates) {
  const allowedFields = ['displayName', 'username', 'bio', 'color', 'avatarUrl'];
  const updateData = {};

  allowedFields.forEach(field => {
    if (updates[field] !== undefined) updateData[field] = updates[field];
  });

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-authProviders -__v');

  if (!user) throw new Error('User not found');
  return user;
}

/**
 * Search users
 */
export async function searchUsers(query) {
  if (!query) return [];
  return User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } }
    ]
  })
    .limit(10)
    .select('-authProviders -__v');
}

/* ─────────────────────────────
   FRIEND SYSTEM
───────────────────────────── */

/**
 * Send friend request
 */
export async function sendFriendRequest(fromUserId, toUserId) {
  if (fromUserId === toUserId)
    throw new Error('Cannot add yourself');

  const [fromUser, toUser] = await Promise.all([
    User.findById(fromUserId),
    User.findById(toUserId)
  ]);

  if (!fromUser || !toUser)
    throw new Error('User not found');

  // Already friends
  if (fromUser.friends.includes(toUserId))
    throw new Error('Already friends');

  // Request already sent
  if (
    fromUser.friendRequests.outgoing.some(
      r => r.to.toString() === toUserId
    )
  ) {
    throw new Error('Friend request already sent');
  }

  // Incoming request exists → auto accept
  if (
    fromUser.friendRequests.incoming.some(
      r => r.from.toString() === toUserId
    )
  ) {
    return acceptFriendRequest(fromUserId, toUserId);
  }

  fromUser.friendRequests.outgoing.push({ to: toUserId });
  toUser.friendRequests.incoming.push({ from: fromUserId });

  await Promise.all([fromUser.save(), toUser.save()]);
  return { success: true };
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(userId, fromUserId) {
  const [user, fromUser] = await Promise.all([
    User.findById(userId),
    User.findById(fromUserId)
  ]);

  if (!user || !fromUser)
    throw new Error('User not found');

  // Remove requests
  user.friendRequests.incoming =
    user.friendRequests.incoming.filter(
      r => r.from.toString() !== fromUserId
    );

  fromUser.friendRequests.outgoing =
    fromUser.friendRequests.outgoing.filter(
      r => r.to.toString() !== userId
    );

  // Add friends
  user.friends.push(fromUserId);
  fromUser.friends.push(userId);

  await Promise.all([user.save(), fromUser.save()]);
  return { success: true };
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(userId, fromUserId) {
  const [user, fromUser] = await Promise.all([
    User.findById(userId),
    User.findById(fromUserId)
  ]);

  if (!user || !fromUser)
    throw new Error('User not found');

  user.friendRequests.incoming =
    user.friendRequests.incoming.filter(
      r => r.from.toString() !== fromUserId
    );

  fromUser.friendRequests.outgoing =
    fromUser.friendRequests.outgoing.filter(
      r => r.to.toString() !== userId
    );

  await Promise.all([user.save(), fromUser.save()]);
  return { success: true };
}

/**
 * Cancel sent request
 */
export async function cancelFriendRequest(userId, toUserId) {
  const [user, toUser] = await Promise.all([
    User.findById(userId),
    User.findById(toUserId)
  ]);

  if (!user || !toUser)
    throw new Error('User not found');

  user.friendRequests.outgoing =
    user.friendRequests.outgoing.filter(
      r => r.to.toString() !== toUserId
    );

  toUser.friendRequests.incoming =
    toUser.friendRequests.incoming.filter(
      r => r.from.toString() !== userId
    );

  await Promise.all([user.save(), toUser.save()]);
  return { success: true };
}

/**
 * Get friends list
 */
export async function getFriends(userId) {
  const user = await User.findById(userId)
    .populate('friends', 'username displayName avatarUrl color isOnline lastSeen');

  if (!user) throw new Error('User not found');
  return user.friends;
}

/**
 * Get pending friend requests
 */
export async function getFriendRequests(userId) {
  const user = await User.findById(userId)
    .populate('friendRequests.incoming.from', 'username displayName avatarUrl color');

  if (!user) throw new Error('User not found');

  return user.friendRequests.incoming;
}
