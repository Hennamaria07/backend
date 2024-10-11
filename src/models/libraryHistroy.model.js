import mongoose, { Schema } from 'mongoose';

const LibraryHistorySchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  borrowDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Borrowed', 'Returned'],
    default: 'Borrowed',
  },
}, { timestamps: true });

const LibraryHistory = mongoose.model('LibraryHistory', LibraryHistorySchema);

export default LibraryHistory;
