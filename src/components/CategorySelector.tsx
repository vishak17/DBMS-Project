'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  icon: string;
  emoji: string;
  color: string;
  type: 'income' | 'expense';
}

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
  selectedCategory?: Category | null;
  type: 'income' | 'expense';
}

const EMOJI_SUGGESTIONS = [
  '🍔', '🍕', '🍜', '🍣', '☕', '🍷', // Food & Drinks
  '🛍️', '👕', '👖', '👟', '💄', '🛒', // Shopping
  '🚗', '🚕', '🚌', '✈️', '🚲', '🚂', // Transportation
  '🏠', '🏢', '🏡', '🏘️', '🏰', '⛺', // Housing
  '💡', '📱', '💻', '🔌', '💧', '🔥', // Utilities
  '🎬', '🎮', '🎵', '🎨', '🎭', '🎪', // Entertainment
  '⚕️', '💊', '🏥', '👨‍⚕️', '💉', '🩺', // Healthcare
  '📚', '🎓', '✏️', '📝', '🎒', '🏫', // Education
  '🎁', '💝', '💐', '🎂', '🎊', '🎉', // Gifts
  '💰', '💵', '💸', '🏦', '💳', '📈', // Money
];

export default function CategorySelector({ onSelect, selectedCategory, type }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💰');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // First, try to initialize categories if they don't exist
        await fetch('/api/categories/init', { method: 'POST' });
        
        // Then fetch categories
        const res = await fetch(`/api/categories?type=${type}`);
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        console.log('Fetched categories:', data); // Debug log
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [type]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setError(null);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.trim(),
          emoji: selectedEmoji,
          type
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }

      const category = await res.json();
      setCategories([...categories, category]);
      setNewCategory('');
      setSelectedEmoji('💰');
      setShowAddForm(false);
      onSelect(category);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => onSelect(category)}
            className={`group relative p-4 rounded-xl transition-all ${
              selectedCategory?._id === category._id
                ? 'ring-2 ring-blue-500 scale-105'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: category.color + '20' }}
          >
            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {category.name} {category.emoji}
            </div>
            
            <div className="text-2xl mb-1">{category.emoji}</div>
            <div className="text-sm font-medium text-white truncate">
              {category.name}
            </div>
          </button>
        ))}

        {/* Add New Category Button */}
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="col-span-full group relative p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-blue-500 hover:text-blue-500 transition-all hover:scale-105"
        >
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Add Custom Category
          </div>

          <div className="flex items-center justify-center gap-2">
            <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-neutral-200">Add Category</div>
          </div>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full border border-[#2a2a2a]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Add New Category</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Select Emoji
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`p-2 rounded transition-all ${
                        selectedEmoji === emoji
                          ? 'bg-blue-500 text-white scale-110'
                          : 'hover:bg-neutral-800 hover:scale-105'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-200"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 