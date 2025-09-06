export interface DatabaseExpense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface UpdateExpenseData {
  title?: string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}