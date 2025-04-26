import mongoose, { Schema } from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  color: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true, default: '#6366f1' },
    icon: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.Category || 
  mongoose.model<ICategory>('Category', categorySchema);
