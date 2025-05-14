import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import User from '@/models/User';

const defaultCategories = [
  // Expense Categories
  { name: 'Food & Dining', icon: 'utensils', emoji: '🍔', color: '#FF6B6B', type: 'expense' },
  { name: 'Shopping', icon: 'shopping-bag', emoji: '🛍️', color: '#4ECDC4', type: 'expense' },
  { name: 'Transportation', icon: 'car', emoji: '🚗', color: '#45B7D1', type: 'expense' },
  { name: 'Housing', icon: 'home', emoji: '🏠', color: '#96CEB4', type: 'expense' },
  { name: 'Utilities', icon: 'bolt', emoji: '💡', color: '#FFEEAD', type: 'expense' },
  { name: 'Entertainment', icon: 'film', emoji: '🎬', color: '#D4A5A5', type: 'expense' },
  { name: 'Healthcare', icon: 'heart-pulse', emoji: '⚕️', color: '#9B59B6', type: 'expense' },
  { name: 'Education', icon: 'graduation-cap', emoji: '📚', color: '#3498DB', type: 'expense' },
  { name: 'Travel', icon: 'plane', emoji: '✈️', color: '#E67E22', type: 'expense' },
  { name: 'Gifts Given', icon: 'gift', emoji: '🎁', color: '#E74C3C', type: 'expense' },
  
  // Income Categories
  { name: 'Salary', icon: 'money-bill', emoji: '💰', color: '#2ECC71', type: 'income' },
  { name: 'Investments', icon: 'chart-line', emoji: '📈', color: '#F1C40F', type: 'income' },
  { name: 'Freelance', icon: 'briefcase', emoji: '💼', color: '#1ABC9C', type: 'income' },
  { name: 'Gifts Received', icon: 'gift', emoji: '🎁', color: '#E74C3C', type: 'income' },
  { name: 'Other Income', icon: 'tag', emoji: '📌', color: '#95A5A6', type: 'income' }
];

async function seedDefaultCategories() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Creating categories for user: ${user.email}`);

      // Delete existing categories for this user
      await Category.deleteMany({ userId: user._id });
      console.log('Deleted existing categories');

      // Create new categories
      const categories = await Category.create(
        defaultCategories.map(category => ({
          ...category,
          userId: user._id
        }))
      );

      console.log(`Created ${categories.length} categories for ${user.email}`);
    }

    console.log('Successfully seeded categories for all users');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedDefaultCategories(); 