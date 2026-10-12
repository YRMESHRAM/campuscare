const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility is required'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Specific location is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComplaintCategory',
      required: [true, 'Category is required'],
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'On Hold',
        'Escalated',
        'Resolved',
        'Closed',
        'Reopened',
        'Rejected',
      ],
      default: 'Submitted',
      index: true,
    },
    attachments: [attachmentSchema],
    resolutionDeadline: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    holdReason: {
      type: String,
      trim: true,
    },
    escalationReason: {
      type: String,
      trim: true,
    },
    reopenReason: {
      type: String,
      trim: true,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for searching & filtering
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ facilityId: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
