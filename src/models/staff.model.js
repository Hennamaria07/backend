import mongoose, { Schema } from 'mongoose';

const StaffSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    publicId: String,
    url: String,
  },
  role: {
    type: String,
    default: 'staff',
  },
  password: {
    type: String,
    required: true,
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  isVerified: {
      type: Boolean,
      default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
}, { timestamps: true });

const Staff = mongoose.model('Staff', StaffSchema);

export default Staff;