import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      transform: (v: any) => {
        if (typeof v === 'string') {
          return new mongoose.Types.ObjectId(v.padStart(24, '0'));
        }
        return v;
      }
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total income cannot be negative']
    },
    totalExpenses: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Total expenses cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Create index on userId for faster lookups
AccountSchema.index({ userId: 1 }, { unique: true });

export default mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema); 