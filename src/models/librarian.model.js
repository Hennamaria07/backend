import mongoose, { Schema } from 'mongoose';

const LibrarianSchema = new Schema({
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
    default: 'librarian',
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

const Librarian = mongoose.model('Librarian', LibrarianSchema);

export default Librarian;