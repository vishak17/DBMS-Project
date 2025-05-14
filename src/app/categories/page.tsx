'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Tag, ShoppingBag, Home, Car, Utensils, Coffee, Gift, DollarSign } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  monthlyBudget: number | null;
  usage: {
    income: number;
    expense: number;
    incomeCount: number;
    expenseCount: number;
  };
}

const ICONS = {
  tag: Tag,
  shopping: ShoppingBag,
  home: Home,
  car: Car,
  food: Utensils,
  coffee: Coffee,
  gift: Gift,
  money: DollarSign,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('tag');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setError(null);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.trim(),
          icon: selectedIcon,
          color: selectedColor,
          monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null
        }),
    });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create category');
      }

      const category = await res.json();
      setCategories([...categories, category]);
      setNewCategory('');
      setSelectedIcon('tag');
      setSelectedColor('#3B82F6');
      setMonthlyBudget('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = async (category: Category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setMonthlyBudget(category.monthlyBudget?.toString() || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !newCategory.trim()) return;

    try {
      setError(null);
      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.trim(),
          icon: selectedIcon,
          color: selectedColor,
          monthlyBudget: monthlyBudget ? Number(monthlyBudget) : null
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update category');
      }

      const updatedCategory = await res.json();
      setCategories(categories.map(cat => 
        cat._id === updatedCategory._id ? updatedCategory : cat
      ));
      setEditingCategory(null);
      setNewCategory('');
      setSelectedIcon('tag');
      setSelectedColor('#3B82F6');
      setMonthlyBudget('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setError(null);
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Categories</h1>

          {/* Add/Edit Category Form */}
          <form onSubmit={editingCategory ? handleUpdate : handleSubmit} className="mb-8">
            <div className="bg-[#1F2937] rounded-xl p-6 space-y-4">
              <div className="flex gap-4">
        <input
                  type="text"
          value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 p-2 rounded border border-gray-600 bg-[#374151] text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(ICONS).map(([key, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedIcon(key)}
                        className={`p-2 rounded ${
                          selectedIcon === key
                            ? 'bg-[#3B82F6] text-white'
                            : 'bg-[#374151] text-gray-300 hover:bg-[#4B5563]'
                        }`}
                      >
                        <Icon size={20} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="Enter budget amount"
                    className="w-full p-2 rounded border border-gray-600 bg-[#374151] text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory('');
                      setSelectedIcon('tag');
                      setSelectedColor('#3B82F6');
                      setMonthlyBudget('');
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
        <button
          type="submit"
                  className="bg-[#3B82F6] text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {editingCategory ? (
                    <>
                      <Edit2 size={20} />
                      Update Category
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} />
                      Add Category
                    </>
                  )}
        </button>
              </div>
            </div>
      </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Categories List */}
          <div className="bg-[#1F2937] rounded-xl shadow overflow-hidden">
            {loading ? (
              <div className="p-4 text-gray-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-gray-400">No categories found. Add your first category above!</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {categories.map((category) => {
                  const Icon = ICONS[category.icon as keyof typeof ICONS] || Tag;
                  const spent = category.usage.expense;
                  const budget = category.monthlyBudget || 0;
                  const progress = budget > 0 ? (spent / budget) * 100 : 0;

                  return (
                    <li
                      key={category._id}
                      className="p-4 hover:bg-[#374151] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded"
                            style={{ backgroundColor: category.color }}
                          >
                            <Icon size={20} className="text-white" />
                          </div>
                          <span className="text-white font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit category"
                          >
                            <Edit2 size={20} />
                          </button>
            <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 size={20} />
            </button>
                        </div>
                      </div>

                      {/* Usage Statistics */}
                      <div className="ml-11 space-y-2">
                        <div className="text-sm text-gray-400">
                          This month: {formatAmount(spent)} spent
                          {budget > 0 && ` of ${formatAmount(budget)} budget`}
                        </div>
                        {budget > 0 && (
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(spent, budget)}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        )}
                        <div className="text-sm text-gray-400">
                          {category.usage.expenseCount} transactions
                        </div>
                      </div>
          </li>
                  );
                })}
      </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
