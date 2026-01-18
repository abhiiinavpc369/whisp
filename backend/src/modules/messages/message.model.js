// message.model.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    /* ───────── MESSAGE STATE ───────── */

    deliveredAt: {
      type: Date,
      default: null
    },

    seenAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
      index: true
    },

    /* ───────── DELETION ───────── */

    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

/* ───────── INDEXES FOR SCALE ───────── */

// Fast chat loading
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// Fast unread queries
MessageSchema.index({ recipient: 1, status: 1 });

// Prevent duplicates (optional safety)
MessageSchema.index({ sender: 1, createdAt: 1 });

export const Message = mongoose.model('Message', MessageSchema);
