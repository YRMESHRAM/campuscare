const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
    },
    facilityType: {
      type: String,
      required: [true, 'Facility type is required'],
      enum: [
        'Classroom',
        'Laboratory',
        'Library',
        'Hostel',
        'Cafeteria',
        'Washroom',
        'Auditorium',
        'Sports Facility',
        'Wi-Fi/Network',
        'Electrical',
        'Plumbing',
        'Furniture',
        'Other',
      ],
    },
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true,
    },
    floorOrBlock: {
      type: String,
      trim: true,
    },
    departmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    responsibleUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

facilitySchema.index({ name: 1, building: 1 });

module.exports = mongoose.model('Facility', facilitySchema);
