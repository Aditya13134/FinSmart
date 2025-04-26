import mongoose, { Schema } from 'mongoose';

export interface IBudget {
  category: string;
  amount: number;
  month: number; // 1-12
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

// Compound index to ensure only one budget per category per month/year
budgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Budget || 
  mongoose.model<IBudget>('Budget', budgetSchema);
