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
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;