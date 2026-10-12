const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

complaintHistorySchema.index({ complaintId: 1, createdAt: -1 });

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
