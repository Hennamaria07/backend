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
  photo: {
    publicId: String,
    url: String,
  },
  class: {
    type: String,
    required: true,
  },
  contactInfo: {
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
    },
  },
  guardian: {
    name: {
      type: String,
    },
    relationship: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
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
