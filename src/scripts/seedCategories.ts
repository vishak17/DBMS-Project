import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import User from '@/models/User';

const defaultCategories = [
  // Expense Categories
  { name: 'Food & Dining', symbol: '🍔', color: '#FF6B6B', type: 'expense' },
  { name: 'Shopping', symbol: '🛍️', color: '#4ECDC4', type: 'expense' },
  { name: 'Transportation', symbol: '🚗', color: '#45B7D1', type: 'expense' },
  { name: 'Housing', symbol: '🏠', color: '#96CEB4', type: 'expense' },
  { name: 'Utilities', symbol: '💡', color: '#FFEEAD', type: 'expense' },
  { name: 'Entertainment', symbol: '🎬', color: '#D4A5A5', type: 'expense' },
  { name: 'Healthcare', symbol: '⚕️', color: '#9B59B6', type: 'expense' },
  { name: 'Education', symbol: '📚', color: '#3498DB', type: 'expense' },
  { name: 'Travel', symbol: '✈️', color: '#E67E22', type: 'expense' },
  { name: 'Gifts', symbol: '🎁', color: '#E74C3C', type: 'expense' },
  
  // Income Categories
  { name: 'Salary', symbol: '💰', color: '#2ECC71', type: 'income' },
  { name: 'Investments', symbol: '📈', color: '#F1C40F', type: 'income' },
  { name: 'Freelance', symbol: '💼', color: '#1ABC9C', type: 'income' },
  { name: 'Gifts', symbol: '🎁', color: '#E74C3C', type: 'income' },
  { name: 'Other', symbol: '📌', color: '#95A5A6', type: 'income' }
];

async function seedCategories() {
  try {
    await connectDB();
    
    // Create default categories for each user
    const users = await User.find({});
    
    for (const user of users) {
      for (const category of defaultCategories) {
        await Category.findOneAndUpdate(
          { name: category.name, userId: user._id },
          {
            ...category,
            userId: user._id,
            isDefault: true
          },
          { upsert: true }
        );
      }
    }
    
    console.log('Default categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories(); 