const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    collegeId: {
      type: String,
      required: [true, 'College ID / Enrollment / Employee ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // do not return by default
    },
    role: {
      type: String,
      required: true,
      enum: [
        'student',
        'faculty',
        'coordinator',
        'facility_manager',
        'hod',
        'admin',
      ],
      default: 'student',
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    academicYear: {
      type: String,
      trim: true,
    },
    assignedFacilityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
      },
    ],
    authorizedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComplaintCategory',
      },
    ],
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    organizationalLevel: {
      type: Number,
      default: 1, // 1: Student/Faculty, 2: Coordinator/Manager, 3: HOD, 4: Admin
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

module.exports = mongoose.model('User', userSchema);
