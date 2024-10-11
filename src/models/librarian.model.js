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
}, { timestamps: true });

const Librarian = mongoose.model('Librarian', LibrarianSchema);

export default Librarian;