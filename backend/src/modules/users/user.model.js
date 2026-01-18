import mongoose from 'mongoose';

/**
 * Friend request sub-schema
 * Keeps request history clean and scalable
 */
const friendRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * User schema (extended, not rewritten)
 */
const userSchema = new mongoose.Schema({
  /* ---------- AUTH ---------- */
  googleId: { type: String, unique: true, sparse: true },

  authProviders: {
    google: {
      googleId: String
    }
  },

  /* ---------- PROFILE ---------- */
  username: { type: String, required: true, unique: true },
  displayName: String,
  email: String,
  bio: String,
  avatarUrl: String,
  color: { type: String, default: 'primary' },

  /* ---------- SOCIAL ---------- */
  friends: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],

  friendRequests: {
    incoming: [friendRequestSchema],
    outgoing: [
      {
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },

  /* ---------- PRESENCE ---------- */
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,

  /* ---------- META ---------- */
  lastLogin: Date

}, { timestamps: true });

/**
 * Indexes (important for scale)
 */
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'friendRequests.incoming.from': 1 });

export const User = mongoose.model('User', userSchema);
