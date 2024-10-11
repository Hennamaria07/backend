import mongoose, { Schema } from 'mongoose';

const FeesHistorySchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  feeType: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const FeesHistory = mongoose.model('FeesHistory', FeesHistorySchema);

export default FeesHistory;
