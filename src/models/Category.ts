import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    default: 'tag'
  },
  emoji: {
    type: String,
    required: true,
    default: '📌'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  monthlyBudget: {
    type: Number,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category names per user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default Category;
