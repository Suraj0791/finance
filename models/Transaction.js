import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type is required'],
  },
  category: {
    type: String,
    default: 'Other',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
