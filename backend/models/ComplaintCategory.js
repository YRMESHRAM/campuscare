const mongoose = require('mongoose');

const complaintCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    applicableFacilityTypes: [
      {
        type: String,
      },
    ],
    defaultDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    defaultPriority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    resolutionTargetHours: {
      type: Number,
      default: 48,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ComplaintCategory', complaintCategorySchema);
