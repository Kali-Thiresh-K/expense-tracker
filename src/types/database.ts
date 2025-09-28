export interface BaseExpense {
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string | Date;
}

export interface DatabaseExpense extends BaseExpense {
  _id: string;
  id?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData extends BaseExpense {
  _id?: string;
  id?: string;
}

export interface UpdateExpenseData extends Partial<BaseExpense> {
  _id?: string;
  id?: string;
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