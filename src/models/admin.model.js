import mongoose, { Schema } from 'mongoose';

const AdminSchema = new Schema({
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
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
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

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;