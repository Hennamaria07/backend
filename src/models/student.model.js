import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema({
  name: {
      type: String,
      required: true,
      trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
  },
  guardian: {
    name: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Graduated', 'Transferred'],
    default: 'Active',
  },
  libraryHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'LibraryHistory',
  }],
  feesHistory: [{
    type: Schema.Types.ObjectId,
    ref: 'FeesHistory',
  }],
}, { timestamps: true });

const Student = mongoose.model('Student', StudentSchema);

export default Student;
