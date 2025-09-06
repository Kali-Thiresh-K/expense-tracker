import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { DatabaseExpense, CreateExpenseData, UpdateExpenseData } from '@/types/database';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<DatabaseExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch expenses from Supabase
  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error fetching expenses",
        description: "Unable to load your expenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new expense
  const addExpense = async (expenseData: CreateExpenseData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add expenses.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setExpenses(prev => [data, ...prev]);
      toast({
        title: "Expense added successfully",
        description: `Added ${expenseData.title} for ₹${expenseData.amount}`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error adding expense",
        description: "Unable to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update expense
  const updateExpense = async (id: string, expenseData: UpdateExpenseData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setExpenses(prev => 
        prev.map(expense => 
          expense.id === id ? data : expense
        )
      );
      toast({
        title: "Expense updated successfully",
        description: `Updated ${data.title}`,
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error updating expense",
        description: "Unable to update expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast({
        title: "Expense deleted successfully",
        description: "The expense has been removed.",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error deleting expense",
        description: "Unable to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate monthly total
  const getMonthlyTotal = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  // Calculate yearly total
  const getYearlyTotal = () => {
    const currentYear = new Date().getFullYear();
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + Number(expense.amount), 0);
  };

  // Get yearly breakdown by month
  const getYearlyBreakdown = () => {
    const currentYear = new Date().getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      const total = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === index && 
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + Number(expense.amount), 0);

      return {
        name: month,
        value: total,
        color: `hsl(${(index * 30) % 360}, 70%, 50%)`
      };
    });
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const categoryTotals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + Number(expense.amount);
    });

    const colors = [
      'hsl(25, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(262, 83%, 58%)',
      'hsl(292, 84%, 61%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)',
      'hsl(200, 95%, 40%)', 'hsl(160, 84%, 39%)'
    ];

    return Object.entries(categoryTotals).map(([category, total], index) => ({
      name: category,
      value: total,
      color: colors[index % colors.length]
    }));
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getMonthlyTotal,
    getYearlyTotal,
    getYearlyBreakdown,
    getCategoryBreakdown,
    refetch: fetchExpenses
  };
};