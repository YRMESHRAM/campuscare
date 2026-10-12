const mongoose = require('mongoose');

const complaintCommentSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message is required'],
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['student-visible', 'internal'],
      default: 'student-visible',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

complaintCommentSchema.index({ complaintId: 1, createdAt: 1 });

module.exports = mongoose.model('ComplaintComment', complaintCommentSchema);
