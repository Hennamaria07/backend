import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    publicId: String,
    url: String,
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