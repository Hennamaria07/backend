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
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Staff = mongoose.model('Staff', StaffSchema);

export default Staff;