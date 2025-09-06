import { Expense, Category, Badge } from "@/types/expense";

export const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍽️', color: 'hsl(25 95% 53%)', budget: 5000 },
  { id: '2', name: 'Transportation', icon: '🚗', color: 'hsl(142 76% 36%)', budget: 3000 },
  { id: '3', name: 'Shopping', icon: '🛍️', color: 'hsl(262 83% 58%)', budget: 4000 },
  { id: '4', name: 'Entertainment', icon: '🎬', color: 'hsl(292 84% 61%)', budget: 2000 },
  { id: '5', name: 'Bills & Utilities', icon: '💡', color: 'hsl(38 92% 50%)', budget: 8000 },
  { id: '6', name: 'Healthcare', icon: '🏥', color: 'hsl(0 84% 60%)', budget: 3000 },
  { id: '7', name: 'Education', icon: '📚', color: 'hsl(200 95% 40%)', budget: 2000 },
  { id: '8', name: 'Travel', icon: '✈️', color: 'hsl(160 84% 39%)', budget: 5000 }
];

export const defaultBadges: Badge[] = [
  {
    id: '1',
    title: 'Budget Ninja',
    description: 'Stay under budget for 3 consecutive months',
    icon: '🥷',
    earned: false,
    requirement: 'Under budget 3 months'
  },
  {
    id: '2',
    title: 'Frugal King',
    description: 'Save more than 20% of your budget',
    icon: '👑',
    earned: false,
    requirement: 'Save 20% of budget'
  },
  {
    id: '3',
    title: 'Expense Tracker',
    description: 'Add your first expense',
    icon: '🎯',
    earned: true,
    earnedDate: new Date(),
    requirement: 'Add first expense'
  },
  {
    id: '4',
    title: 'Category Master',
    description: 'Use all expense categories',
    icon: '📊',
    earned: false,
    requirement: 'Use all categories'
  }
];

export const suggestCategory = (title: string): string => {
  const foodKeywords = ['restaurant', 'food', 'pizza', 'burger', 'coffee', 'lunch', 'dinner', 'breakfast', 'domino', 'mcdonalds', 'starbucks'];
  const transportKeywords = ['uber', 'taxi', 'gas', 'fuel', 'metro', 'bus', 'train', 'parking'];
  const shoppingKeywords = ['amazon', 'flipkart', 'mall', 'store', 'shopping', 'clothes', 'electronics'];
  const entertainmentKeywords = ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'party'];
  const billsKeywords = ['electricity', 'water', 'internet', 'phone', 'rent', 'insurance', 'loan'];
  const healthKeywords = ['hospital', 'doctor', 'medicine', 'pharmacy', 'clinic', 'medical'];
  
  const lowerTitle = title.toLowerCase();
  
  if (foodKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Food & Dining';
  if (transportKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Transportation';
  if (shoppingKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Shopping';
  if (entertainmentKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Entertainment';
  if (billsKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Bills & Utilities';
  if (healthKeywords.some(keyword => lowerTitle.includes(keyword))) return 'Healthcare';
  
  return 'Other';
};

export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toLocaleString('en-IN')}`;
};

export const calculateCategorySpending = (expenses: Expense[], categories: Category[]) => {
  return categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.name);
    const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = category.budget ? (spent / category.budget) * 100 : 0;
    
    return {
      category: category.name,
      spent,
      budget: category.budget || 0,
      percentage: Math.min(percentage, 100),
      color: category.color,
      icon: category.icon
    };
  });
};

export const generateSavingSuggestion = (categorySpending: any[]): string[] => {
  const suggestions: string[] = [];
  
  categorySpending.forEach(cat => {
    if (cat.percentage > 80) {
      suggestions.push(`You've spent ${cat.percentage.toFixed(0)}% of your ${cat.category} budget. Consider reducing expenses in this category.`);
    }
  });
  
  if (suggestions.length === 0) {
    suggestions.push("Great job! You're managing your budget well. Keep it up!");
  }
  
  return suggestions;
};