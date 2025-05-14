import mongoose, { Schema, models } from 'mongoose';

const BudgetGoalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  monthlyLimit: {
    type: Number,
    required: true,
  },
});

const BudgetGoal = models.BudgetGoal || mongoose.model('BudgetGoal', BudgetGoalSchema);
export default BudgetGoal; 