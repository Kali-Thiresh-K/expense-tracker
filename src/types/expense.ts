export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  currency?: string;
  isRecurring?: boolean;
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  requirement: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categoryBreakdown: {
    category: string;
    spent: number;
    budget: number;
    percentage: number;
  }[];
}