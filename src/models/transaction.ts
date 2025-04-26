import mongoose, { Schema } from 'mongoose';

export interface ITransaction {
  _id?: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  type: 'income' | 'expense';
  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    category: { type: String, required: false },
    type: { type: String, enum: ['income', 'expense'], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', transactionSchema);
