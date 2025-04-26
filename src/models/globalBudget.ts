import mongoose, { Schema } from 'mongoose';

export interface IGlobalBudget {
  amount: number;
  month: number;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const globalBudgetSchema = new Schema<IGlobalBudget>({
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
}, { timestamps: true });

globalBudgetSchema.index({ month: 1, year: 1 }, { unique: true });

export default mongoose.models.GlobalBudget || mongoose.model<IGlobalBudget>('GlobalBudget', globalBudgetSchema);
